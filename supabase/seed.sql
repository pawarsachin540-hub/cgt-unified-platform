-- ============================================================================
-- Demo seed data. Run AFTER 0001_init.sql in the Supabase SQL Editor.
-- Optional — gives every module a few realistic rows so the UI isn't empty.
-- Safe-ish to re-run, but it will create duplicates; clear tables first if needed.
-- ============================================================================

insert into public.projects (code, title, modality, phase, status, lead, description) values
  ('PRJ-DEMO-1', 'CD19 CAR-T process development', 'CAR-T (CD19)', 'Phase I', 'Active', 'A. Sharma', 'Autologous CD19 CAR-T manufacturing and analytical platform.'),
  ('PRJ-DEMO-2', 'Lentiviral vector scale-up', 'Lentiviral Vector', 'Preclinical', 'Active', 'R. Patel', 'LV vector titer and RCL strategy.'),
  ('PRJ-DEMO-3', 'AAV anti-VEGF program', 'AAV', 'Discovery', 'Planning', 'S. Mehta', 'rAAV analytical method development.');

insert into public.suppliers (code, name, category, contact_email, qualified, status) values
  ('SUP-DEMO-1', 'Takara Bio', 'Reagent', 'sales@takara.example', true, 'Approved'),
  ('SUP-DEMO-2', 'Thermo Fisher', 'Consumable', 'orders@thermo.example', true, 'Approved'),
  ('SUP-DEMO-3', 'QIAGEN', 'Reagent', 'support@qiagen.example', true, 'Approved');

insert into public.materials (code, name, material_type, grade, unit, supplier_id, status, storage) values
  ('MAT-DEMO-1', 'Lenti-X qPCR Titration Kit', 'Reagent', 'Research', 'kit', (select id from public.suppliers where code='SUP-DEMO-1'), 'Approved', '-20 C'),
  ('MAT-DEMO-2', 'dPCR Probe Master Mix', 'Reagent', 'Research', 'mL', (select id from public.suppliers where code='SUP-DEMO-3'), 'Approved', '-20 C'),
  ('MAT-DEMO-3', 'Cell culture medium (GMP)', 'Raw Material', 'GMP', 'L', (select id from public.suppliers where code='SUP-DEMO-2'), 'Approved', '2-8 C');

insert into public.inventory_lots (code, material_id, lot_number, quantity, location, received_date, expiry_date, status) values
  ('LOT-DEMO-1', (select id from public.materials where code='MAT-DEMO-1'), 'TKR-2025-118', 4, 'Store A · Freezer 2', '2026-05-10', '2027-05-10', 'Released'),
  ('LOT-DEMO-2', (select id from public.materials where code='MAT-DEMO-3'), 'GMP-MED-441', 20, 'Store B · Cold room', '2026-06-01', '2026-12-01', 'Quarantine');

insert into public.purchase_orders (code, supplier_id, description, requested_by, total_value, currency, status, need_by_date) values
  ('PO-DEMO-1', (select id from public.suppliers where code='SUP-DEMO-3'), 'dPCR consumables — Q3 replenishment', 'QC2 team', 185000, 'INR', 'Approved', '2026-07-15'),
  ('PO-DEMO-2', (select id from public.suppliers where code='SUP-DEMO-2'), 'GMP medium bulk order', 'Manufacturing', 420000, 'INR', 'Submitted', '2026-07-30');

insert into public.batches (code, product, project_id, stage, scale, manufacture_date, status, mbr_reference) values
  ('BR-DEMO-1', 'CD19 CAR-T drug product', (select id from public.projects where code='PRJ-DEMO-1'), 'Final Product', '1 patient dose', '2026-06-12', 'In Process', 'MBR-CART-019'),
  ('BR-DEMO-2', 'LV vector bulk', (select id from public.projects where code='PRJ-DEMO-2'), 'Downstream', '10 L', '2026-06-05', 'Completed', 'MBR-LV-007');

insert into public.specifications (code, attribute, category, method, acceptance, unit, status) values
  ('SPEC-DEMO-1', 'Vector copy number', 'Quantity', 'dPCR (QIAcuity)', '0.5 - 5.0', 'copies/cell', 'Effective'),
  ('SPEC-DEMO-2', 'Replication competent lentivirus', 'Safety', 'VSVG RT-PCR', 'Not detected', '—', 'Effective'),
  ('SPEC-DEMO-3', 'Cell viability', 'Quantity', 'Flow cytometry', '>= 70', '%', 'Effective');

insert into public.qc_results (code, batch_id, spec_id, attribute, result_value, analyst, test_date, status) values
  ('QC-DEMO-1', (select id from public.batches where code='BR-DEMO-1'), (select id from public.specifications where code='SPEC-DEMO-3'), 'Cell viability', '88', 'S. Pawar', '2026-06-13', 'Pass'),
  ('QC-DEMO-2', (select id from public.batches where code='BR-DEMO-2'), (select id from public.specifications where code='SPEC-DEMO-1'), 'Vector copy number', '6.2', 'S. Pawar', '2026-06-07', 'Out of Spec');

insert into public.documents (code, title, doc_type, version, owner, status, effective_date, review_date) values
  ('DOC-DEMO-1', 'VCN determination by dPCR', 'Work Instruction', '2.0', 'QC2', 'Effective', '2026-03-01', '2027-03-01'),
  ('DOC-DEMO-2', 'RCL detection — VSVG targeting', 'SOP', '1.0', 'QC2', 'Effective', '2026-04-15', '2027-04-15'),
  ('DOC-DEMO-3', 'Batch record review and release', 'SOP', '3.1', 'QA', 'In Review', null, null);

insert into public.deviations (code, title, severity, batch_id, reported_by, occurred_date, status, description) values
  ('DEV-DEMO-1', 'VCN result above specification on LV bulk', 'Major', (select id from public.batches where code='BR-DEMO-2'), 'S. Pawar', '2026-06-07', 'Under Investigation', 'Measured VCN 6.2 copies/cell exceeds the 0.5-5.0 range.');

insert into public.capa (code, title, capa_type, deviation_id, owner, due_date, status, action_plan) values
  ('CAPA-DEMO-1', 'Investigate elevated VCN — assay vs process', 'Both', (select id from public.deviations where code='DEV-DEMO-1'), 'QC2', '2026-07-20', 'Action Plan', 'Re-run dPCR with fresh standards; review transduction MOI.');

insert into public.change_controls (code, title, change_type, impact, requested_by, status, description) values
  ('CC-DEMO-1', 'Switch routine RCL method from dPCR to RT-PCR', 'Process', 'Medium', 'QC2', 'Impact Assessment', 'RT-PCR finalized as routine; dPCR retained as robustness evidence.');

insert into public.equipment (code, name, asset_tag, manufacturer, model, location, qualification, status, commission_date) values
  ('EQ-DEMO-1', 'Digital PCR system', 'MIC/QC2/0019', 'QIAGEN', 'QIAcuity One', 'QC Lab 2', 'Qualified', 'Operational', '2025-11-10'),
  ('EQ-DEMO-2', 'Flow cytometer', 'MIC/QC2/0023', 'BD', 'FACSymphony', 'QC Lab 2', 'PQ', 'In Qualification', '2026-05-01');

insert into public.urs_documents (code, title, equipment_id, author, status, requirements) values
  ('URS-DEMO-1', 'URS — digital PCR system', (select id from public.equipment where code='EQ-DEMO-1'), 'QC2', 'Approved', 'Absolute quantification, multiplexing >= 2 targets, 21 CFR Part 11 audit trail.');

insert into public.calibrations (code, equipment_id, due_date, performed_date, performed_by, status, certificate_ref) values
  ('CAL-DEMO-1', (select id from public.equipment where code='EQ-DEMO-1'), '2026-11-10', '2025-11-12', 'Metrology', 'Passed', 'CERT-QIA-2025-44'),
  ('CAL-DEMO-2', (select id from public.equipment where code='EQ-DEMO-2'), '2026-06-15', null, null, 'Overdue', null);

insert into public.maintenance (code, equipment_id, maint_type, due_date, completed_date, technician, status) values
  ('MNT-DEMO-1', (select id from public.equipment where code='EQ-DEMO-1'), 'Preventive', '2026-08-01', null, 'Service vendor', 'Scheduled');

insert into public.batch_releases (code, batch_id, qp, qc_complete, deviations_closed, release_date, status, disposition_notes) values
  ('REL-DEMO-1', (select id from public.batches where code='BR-DEMO-2'), 'Head of QA', false, false, null, 'QA Review', 'Pending closure of DEV-DEMO-1.');

insert into public.training_courses (code, title, category, document_id, status) values
  ('CRS-DEMO-1', 'dPCR VCN method training', 'Technical', (select id from public.documents where code='DOC-DEMO-1'), 'Approved'),
  ('CRS-DEMO-2', 'GMP refresher 2026', 'GMP', null, 'Approved');

insert into public.training_records (code, trainee, course_id, assigned_date, completed_date, score, status) values
  ('TRN-DEMO-1', 'S. Pawar', (select id from public.training_courses where code='CRS-DEMO-1'), '2026-04-01', '2026-04-08', '95%', 'Completed'),
  ('TRN-DEMO-2', 'Lab analyst 2', (select id from public.training_courses where code='CRS-DEMO-2'), '2026-06-01', null, null, 'Assigned');
