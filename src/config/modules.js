// Single source of truth for navigation + every data module.
// Each resource maps to a Supabase table; columns drive the list view,
// fields drive the create/edit form. Add a module by adding an entry here
// plus a matching table in the SQL migration.

export const STATUS_OPTIONS = {
  generic: ['Draft', 'In Review', 'Approved', 'Closed'],
  project: ['Planning', 'Active', 'On Hold', 'Completed', 'Cancelled'],
  eln: ['Draft', 'In Review', 'Signed', 'Witnessed'],
  po: ['Draft', 'Submitted', 'Approved', 'Received', 'Cancelled'],
  inventory: ['Quarantine', 'Released', 'On Hold', 'Rejected', 'Consumed', 'Expired'],
  batch: ['Planned', 'In Process', 'On Hold', 'Completed', 'Discarded'],
  qc: ['Pending', 'In Test', 'Pass', 'Out of Spec', 'Invalidated'],
  doc: ['Draft', 'In Review', 'Effective', 'Superseded', 'Retired'],
  deviation: ['Open', 'Under Investigation', 'CAPA Linked', 'Closed'],
  capa: ['Open', 'Action Plan', 'Implementation', 'Effectiveness Check', 'Closed'],
  change: ['Proposed', 'Impact Assessment', 'Approved', 'Implemented', 'Closed'],
  equipment: ['In Qualification', 'Operational', 'Under Maintenance', 'Out of Service', 'Retired'],
  urs: ['Draft', 'Reviewed', 'Approved', 'Verified'],
  cal: ['Scheduled', 'Passed', 'Failed', 'Overdue'],
  maint: ['Scheduled', 'In Progress', 'Completed', 'Overdue'],
  release: ['Pending Review', 'QC Complete', 'QA Review', 'Released', 'Rejected'],
  training: ['Assigned', 'In Progress', 'Completed', 'Overdue'],
}

const auditColumns = [
  { key: 'created_at', label: 'Created', type: 'datetime' },
]

export const RESOURCES = {
  projects: {
    label: 'Projects', singular: 'Project', table: 'projects', code: 'PRJ',
    columns: [
      { key: 'code', label: 'ID', type: 'code' },
      { key: 'title', label: 'Title' },
      { key: 'modality', label: 'Modality' },
      { key: 'phase', label: 'Phase' },
      { key: 'status', label: 'Status', type: 'status' },
      ...auditColumns,
    ],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'modality', label: 'Modality', type: 'select', options: ['Lentiviral Vector', 'AAV', 'CAR-T (CD19)', 'CAR-T (BCMA)', 'Plasmid', 'mRNA', 'Other'] },
      { name: 'phase', label: 'Phase', type: 'select', options: ['Discovery', 'Preclinical', 'Phase I', 'Phase II', 'Phase III', 'Commercial'] },
      { name: 'status', label: 'Status', type: 'select', options: STATUS_OPTIONS.project },
      { name: 'lead', label: 'Project lead', type: 'text' },
      { name: 'description', label: 'Description', type: 'textarea', full: true },
    ],
    searchKeys: ['code', 'title', 'modality', 'lead'],
  },

  eln: {
    label: 'ELN Entries', singular: 'ELN Entry', table: 'eln_entries', code: 'ELN',
    columns: [
      { key: 'code', label: 'ID', type: 'code' },
      { key: 'title', label: 'Title' },
      { key: 'project_code', label: 'Project', type: 'ref', refTable: 'projects' },
      { key: 'author', label: 'Author' },
      { key: 'status', label: 'Status', type: 'status' },
      ...auditColumns,
    ],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'project_id', label: 'Project', type: 'ref', refTable: 'projects', refLabel: 'title' },
      { name: 'experiment_type', label: 'Experiment type', type: 'select', options: ['Process Development', 'Assay Development', 'Characterization', 'Stability', 'Other'] },
      { name: 'author', label: 'Author', type: 'text' },
      { name: 'status', label: 'Status', type: 'select', options: STATUS_OPTIONS.eln },
      { name: 'objective', label: 'Objective', type: 'textarea', full: true },
      { name: 'observations', label: 'Observations / Result', type: 'textarea', full: true },
    ],
    searchKeys: ['code', 'title', 'author'],
  },

  tech_transfers: {
    label: 'Tech Transfer', singular: 'Tech Transfer', table: 'tech_transfers', code: 'TT',
    columns: [
      { key: 'code', label: 'ID', type: 'code' },
      { key: 'title', label: 'Title' },
      { key: 'from_site', label: 'From' },
      { key: 'to_site', label: 'To' },
      { key: 'status', label: 'Status', type: 'status' },
      ...auditColumns,
    ],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'project_id', label: 'Project', type: 'ref', refTable: 'projects', refLabel: 'title' },
      { name: 'from_site', label: 'Sending unit', type: 'text' },
      { name: 'to_site', label: 'Receiving unit', type: 'text' },
      { name: 'status', label: 'Status', type: 'select', options: STATUS_OPTIONS.generic },
      { name: 'scope', label: 'Scope (process, analytical, materials)', type: 'textarea', full: true },
      { name: 'gaps', label: 'Identified gaps / risks', type: 'textarea', full: true },
    ],
    searchKeys: ['code', 'title', 'from_site', 'to_site'],
  },

  suppliers: {
    label: 'Suppliers', singular: 'Supplier', table: 'suppliers', code: 'SUP',
    columns: [
      { key: 'code', label: 'ID', type: 'code' },
      { key: 'name', label: 'Name' },
      { key: 'category', label: 'Category' },
      { key: 'qualified', label: 'Qualified', type: 'bool' },
      { key: 'status', label: 'Status', type: 'status' },
    ],
    fields: [
      { name: 'name', label: 'Supplier name', type: 'text', required: true },
      { name: 'category', label: 'Category', type: 'select', options: ['Raw Material', 'Consumable', 'Reagent', 'Equipment', 'Service', 'Contract Lab'] },
      { name: 'contact_email', label: 'Contact email', type: 'text' },
      { name: 'qualified', label: 'Qualified vendor', type: 'bool' },
      { name: 'status', label: 'Status', type: 'select', options: STATUS_OPTIONS.generic },
      { name: 'notes', label: 'Notes', type: 'textarea', full: true },
    ],
    searchKeys: ['code', 'name', 'category'],
  },

  materials: {
    label: 'Materials', singular: 'Material', table: 'materials', code: 'MAT',
    columns: [
      { key: 'code', label: 'ID', type: 'code' },
      { key: 'name', label: 'Name' },
      { key: 'material_type', label: 'Type' },
      { key: 'grade', label: 'Grade' },
      { key: 'unit', label: 'Unit' },
      { key: 'status', label: 'Status', type: 'status' },
    ],
    fields: [
      { name: 'name', label: 'Material name', type: 'text', required: true },
      { name: 'material_type', label: 'Type', type: 'select', options: ['Raw Material', 'Excipient', 'Reagent', 'Consumable', 'Reference Standard', 'Intermediate'] },
      { name: 'grade', label: 'Grade', type: 'select', options: ['GMP', 'Research', 'USP/EP', 'In-house'] },
      { name: 'unit', label: 'Unit of measure', type: 'text' },
      { name: 'supplier_id', label: 'Preferred supplier', type: 'ref', refTable: 'suppliers', refLabel: 'name' },
      { name: 'status', label: 'Status', type: 'select', options: STATUS_OPTIONS.generic },
      { name: 'storage', label: 'Storage condition', type: 'text' },
    ],
    searchKeys: ['code', 'name', 'material_type'],
  },

  inventory_lots: {
    label: 'Inventory & Store', singular: 'Inventory Lot', table: 'inventory_lots', code: 'LOT',
    columns: [
      { key: 'code', label: 'Lot ID', type: 'code' },
      { key: 'material_name', label: 'Material', type: 'ref', refTable: 'materials' },
      { key: 'quantity', label: 'Qty', type: 'number' },
      { key: 'location', label: 'Location' },
      { key: 'expiry_date', label: 'Expiry', type: 'date' },
      { key: 'status', label: 'Status', type: 'status' },
    ],
    fields: [
      { name: 'material_id', label: 'Material', type: 'ref', refTable: 'materials', refLabel: 'name', required: true },
      { name: 'lot_number', label: 'Vendor lot number', type: 'text' },
      { name: 'quantity', label: 'Quantity', type: 'number' },
      { name: 'location', label: 'Storage location', type: 'text' },
      { name: 'received_date', label: 'Received date', type: 'date' },
      { name: 'expiry_date', label: 'Expiry date', type: 'date' },
      { name: 'status', label: 'Status', type: 'select', options: STATUS_OPTIONS.inventory },
    ],
    searchKeys: ['code', 'lot_number', 'location'],
  },

  purchase_orders: {
    label: 'Purchase Orders', singular: 'Purchase Order', table: 'purchase_orders', code: 'PO',
    columns: [
      { key: 'code', label: 'PO No.', type: 'code' },
      { key: 'supplier_name', label: 'Supplier', type: 'ref', refTable: 'suppliers' },
      { key: 'description', label: 'Description' },
      { key: 'total_value', label: 'Value', type: 'number' },
      { key: 'status', label: 'Status', type: 'status' },
      ...auditColumns,
    ],
    fields: [
      { name: 'supplier_id', label: 'Supplier', type: 'ref', refTable: 'suppliers', refLabel: 'name', required: true },
      { name: 'description', label: 'Description', type: 'text' },
      { name: 'requested_by', label: 'Requested by', type: 'text' },
      { name: 'total_value', label: 'Total value', type: 'number' },
      { name: 'currency', label: 'Currency', type: 'select', options: ['INR', 'USD', 'EUR', 'GBP'] },
      { name: 'status', label: 'Status', type: 'select', options: STATUS_OPTIONS.po },
      { name: 'need_by_date', label: 'Need-by date', type: 'date' },
      { name: 'notes', label: 'Line items / notes', type: 'textarea', full: true },
    ],
    searchKeys: ['code', 'description', 'requested_by'],
  },

  batches: {
    label: 'Manufacturing Batches', singular: 'Batch', table: 'batches', code: 'BR',
    columns: [
      { key: 'code', label: 'Batch No.', type: 'code' },
      { key: 'product', label: 'Product' },
      { key: 'project_code', label: 'Project', type: 'ref', refTable: 'projects' },
      { key: 'stage', label: 'Stage' },
      { key: 'status', label: 'Status', type: 'status' },
      ...auditColumns,
    ],
    fields: [
      { name: 'product', label: 'Product', type: 'text', required: true },
      { name: 'project_id', label: 'Project', type: 'ref', refTable: 'projects', refLabel: 'title' },
      { name: 'stage', label: 'Stage', type: 'select', options: ['Upstream', 'Downstream', 'Fill/Finish', 'Formulation', 'Final Product'] },
      { name: 'scale', label: 'Scale', type: 'text' },
      { name: 'manufacture_date', label: 'Manufacture date', type: 'date' },
      { name: 'status', label: 'Status', type: 'select', options: STATUS_OPTIONS.batch },
      { name: 'mbr_reference', label: 'MBR reference', type: 'text' },
      { name: 'remarks', label: 'In-process remarks', type: 'textarea', full: true },
    ],
    searchKeys: ['code', 'product', 'mbr_reference'],
  },

  specifications: {
    label: 'Specifications', singular: 'Specification', table: 'specifications', code: 'SPEC',
    columns: [
      { key: 'code', label: 'ID', type: 'code' },
      { key: 'attribute', label: 'Attribute' },
      { key: 'method', label: 'Method' },
      { key: 'acceptance', label: 'Acceptance criteria' },
      { key: 'status', label: 'Status', type: 'status' },
    ],
    fields: [
      { name: 'attribute', label: 'Quality attribute', type: 'text', required: true },
      { name: 'category', label: 'Category', type: 'select', options: ['Identity', 'Quantity', 'Purity', 'Safety', 'Potency'] },
      { name: 'method', label: 'Analytical method', type: 'text' },
      { name: 'acceptance', label: 'Acceptance criteria', type: 'text' },
      { name: 'unit', label: 'Unit', type: 'text' },
      { name: 'status', label: 'Status', type: 'select', options: STATUS_OPTIONS.doc },
    ],
    searchKeys: ['code', 'attribute', 'method'],
  },

  qc_results: {
    label: 'QC Results', singular: 'QC Result', table: 'qc_results', code: 'QC',
    columns: [
      { key: 'code', label: 'ID', type: 'code' },
      { key: 'batch_code', label: 'Batch', type: 'ref', refTable: 'batches' },
      { key: 'attribute', label: 'Attribute' },
      { key: 'result_value', label: 'Result' },
      { key: 'status', label: 'Status', type: 'status' },
      ...auditColumns,
    ],
    fields: [
      { name: 'batch_id', label: 'Batch', type: 'ref', refTable: 'batches', refLabel: 'product', required: true },
      { name: 'spec_id', label: 'Specification', type: 'ref', refTable: 'specifications', refLabel: 'attribute' },
      { name: 'attribute', label: 'Attribute tested', type: 'text' },
      { name: 'result_value', label: 'Result value', type: 'text' },
      { name: 'analyst', label: 'Analyst', type: 'text' },
      { name: 'test_date', label: 'Test date', type: 'date' },
      { name: 'status', label: 'Status', type: 'select', options: STATUS_OPTIONS.qc },
      { name: 'remarks', label: 'Remarks', type: 'textarea', full: true },
    ],
    searchKeys: ['code', 'attribute', 'analyst'],
  },

  documents: {
    label: 'Controlled Documents', singular: 'Document', table: 'documents', code: 'DOC',
    columns: [
      { key: 'code', label: 'Doc ID', type: 'code' },
      { key: 'title', label: 'Title' },
      { key: 'doc_type', label: 'Type' },
      { key: 'version', label: 'Ver' },
      { key: 'status', label: 'Status', type: 'status' },
      { key: 'effective_date', label: 'Effective', type: 'date' },
    ],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'doc_type', label: 'Document type', type: 'select', options: ['SOP', 'Work Instruction', 'Protocol', 'Report', 'Form', 'Specification', 'Policy'] },
      { name: 'version', label: 'Version', type: 'text' },
      { name: 'owner', label: 'Owner', type: 'text' },
      { name: 'status', label: 'Status', type: 'select', options: STATUS_OPTIONS.doc },
      { name: 'effective_date', label: 'Effective date', type: 'date' },
      { name: 'review_date', label: 'Next review date', type: 'date' },
      { name: 'summary', label: 'Summary', type: 'textarea', full: true },
    ],
    searchKeys: ['code', 'title', 'doc_type', 'owner'],
  },

  deviations: {
    label: 'Deviations', singular: 'Deviation', table: 'deviations', code: 'DEV',
    columns: [
      { key: 'code', label: 'ID', type: 'code' },
      { key: 'title', label: 'Title' },
      { key: 'severity', label: 'Severity', type: 'severity' },
      { key: 'batch_code', label: 'Batch', type: 'ref', refTable: 'batches' },
      { key: 'status', label: 'Status', type: 'status' },
      ...auditColumns,
    ],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'severity', label: 'Severity', type: 'select', options: ['Minor', 'Major', 'Critical'] },
      { name: 'batch_id', label: 'Related batch', type: 'ref', refTable: 'batches', refLabel: 'product' },
      { name: 'reported_by', label: 'Reported by', type: 'text' },
      { name: 'occurred_date', label: 'Date of occurrence', type: 'date' },
      { name: 'status', label: 'Status', type: 'select', options: STATUS_OPTIONS.deviation },
      { name: 'description', label: 'Description', type: 'textarea', full: true },
      { name: 'root_cause', label: 'Root cause', type: 'textarea', full: true },
    ],
    searchKeys: ['code', 'title', 'reported_by'],
  },

  capa: {
    label: 'CAPA', singular: 'CAPA', table: 'capa', code: 'CAPA',
    columns: [
      { key: 'code', label: 'ID', type: 'code' },
      { key: 'title', label: 'Title' },
      { key: 'capa_type', label: 'Type' },
      { key: 'owner', label: 'Owner' },
      { key: 'due_date', label: 'Due', type: 'date' },
      { key: 'status', label: 'Status', type: 'status' },
    ],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'capa_type', label: 'Type', type: 'select', options: ['Corrective', 'Preventive', 'Both'] },
      { name: 'deviation_id', label: 'Source deviation', type: 'ref', refTable: 'deviations', refLabel: 'title' },
      { name: 'owner', label: 'Owner', type: 'text' },
      { name: 'due_date', label: 'Due date', type: 'date' },
      { name: 'status', label: 'Status', type: 'select', options: STATUS_OPTIONS.capa },
      { name: 'action_plan', label: 'Action plan', type: 'textarea', full: true },
      { name: 'effectiveness', label: 'Effectiveness check', type: 'textarea', full: true },
    ],
    searchKeys: ['code', 'title', 'owner'],
  },

  change_controls: {
    label: 'Change Controls', singular: 'Change Control', table: 'change_controls', code: 'CC',
    columns: [
      { key: 'code', label: 'ID', type: 'code' },
      { key: 'title', label: 'Title' },
      { key: 'change_type', label: 'Type' },
      { key: 'impact', label: 'Impact' },
      { key: 'status', label: 'Status', type: 'status' },
    ],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'change_type', label: 'Change type', type: 'select', options: ['Process', 'Equipment', 'Document', 'Material', 'Facility', 'System'] },
      { name: 'impact', label: 'Impact level', type: 'select', options: ['Low', 'Medium', 'High'] },
      { name: 'requested_by', label: 'Requested by', type: 'text' },
      { name: 'status', label: 'Status', type: 'select', options: STATUS_OPTIONS.change },
      { name: 'description', label: 'Description of change', type: 'textarea', full: true },
      { name: 'risk_assessment', label: 'Risk assessment', type: 'textarea', full: true },
    ],
    searchKeys: ['code', 'title', 'change_type'],
  },

  equipment: {
    label: 'Equipment Register', singular: 'Equipment', table: 'equipment', code: 'EQ',
    columns: [
      { key: 'code', label: 'Asset ID', type: 'code' },
      { key: 'name', label: 'Name' },
      { key: 'location', label: 'Location' },
      { key: 'qualification', label: 'Qual.' },
      { key: 'status', label: 'Status', type: 'status' },
    ],
    fields: [
      { name: 'name', label: 'Equipment name', type: 'text', required: true },
      { name: 'asset_tag', label: 'Asset tag', type: 'text' },
      { name: 'manufacturer', label: 'Manufacturer', type: 'text' },
      { name: 'model', label: 'Model', type: 'text' },
      { name: 'location', label: 'Location', type: 'text' },
      { name: 'qualification', label: 'Qualification state', type: 'select', options: ['DQ', 'IQ', 'OQ', 'PQ', 'Qualified', 'Pending'] },
      { name: 'status', label: 'Status', type: 'select', options: STATUS_OPTIONS.equipment },
      { name: 'commission_date', label: 'Commission date', type: 'date' },
    ],
    searchKeys: ['code', 'name', 'asset_tag', 'model'],
  },

  urs: {
    label: 'URS / Requirements', singular: 'URS', table: 'urs_documents', code: 'URS',
    columns: [
      { key: 'code', label: 'ID', type: 'code' },
      { key: 'title', label: 'Title' },
      { key: 'equipment_name', label: 'Equipment', type: 'ref', refTable: 'equipment' },
      { key: 'status', label: 'Status', type: 'status' },
    ],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'equipment_id', label: 'Target equipment', type: 'ref', refTable: 'equipment', refLabel: 'name' },
      { name: 'author', label: 'Author', type: 'text' },
      { name: 'status', label: 'Status', type: 'select', options: STATUS_OPTIONS.urs },
      { name: 'requirements', label: 'User requirements', type: 'textarea', full: true },
      { name: 'acceptance', label: 'Acceptance criteria', type: 'textarea', full: true },
    ],
    searchKeys: ['code', 'title', 'author'],
  },

  calibrations: {
    label: 'Calibrations', singular: 'Calibration', table: 'calibrations', code: 'CAL',
    columns: [
      { key: 'code', label: 'ID', type: 'code' },
      { key: 'equipment_name', label: 'Equipment', type: 'ref', refTable: 'equipment' },
      { key: 'due_date', label: 'Due', type: 'date' },
      { key: 'performed_date', label: 'Performed', type: 'date' },
      { key: 'status', label: 'Status', type: 'status' },
    ],
    fields: [
      { name: 'equipment_id', label: 'Equipment', type: 'ref', refTable: 'equipment', refLabel: 'name', required: true },
      { name: 'due_date', label: 'Due date', type: 'date' },
      { name: 'performed_date', label: 'Performed date', type: 'date' },
      { name: 'performed_by', label: 'Performed by', type: 'text' },
      { name: 'status', label: 'Status', type: 'select', options: STATUS_OPTIONS.cal },
      { name: 'certificate_ref', label: 'Certificate reference', type: 'text' },
    ],
    searchKeys: ['code', 'performed_by', 'certificate_ref'],
  },

  maintenance: {
    label: 'Maintenance', singular: 'Maintenance', table: 'maintenance', code: 'MNT',
    columns: [
      { key: 'code', label: 'ID', type: 'code' },
      { key: 'equipment_name', label: 'Equipment', type: 'ref', refTable: 'equipment' },
      { key: 'maint_type', label: 'Type' },
      { key: 'due_date', label: 'Due', type: 'date' },
      { key: 'status', label: 'Status', type: 'status' },
    ],
    fields: [
      { name: 'equipment_id', label: 'Equipment', type: 'ref', refTable: 'equipment', refLabel: 'name', required: true },
      { name: 'maint_type', label: 'Type', type: 'select', options: ['Preventive', 'Corrective', 'Breakdown'] },
      { name: 'due_date', label: 'Due date', type: 'date' },
      { name: 'completed_date', label: 'Completed date', type: 'date' },
      { name: 'technician', label: 'Technician', type: 'text' },
      { name: 'status', label: 'Status', type: 'select', options: STATUS_OPTIONS.maint },
      { name: 'work_done', label: 'Work performed', type: 'textarea', full: true },
    ],
    searchKeys: ['code', 'technician', 'maint_type'],
  },

  releases: {
    label: 'Batch Release', singular: 'Release', table: 'batch_releases', code: 'REL',
    columns: [
      { key: 'code', label: 'ID', type: 'code' },
      { key: 'batch_code', label: 'Batch', type: 'ref', refTable: 'batches' },
      { key: 'qp', label: 'QP / Authorised person' },
      { key: 'release_date', label: 'Release date', type: 'date' },
      { key: 'status', label: 'Status', type: 'status' },
    ],
    fields: [
      { name: 'batch_id', label: 'Batch', type: 'ref', refTable: 'batches', refLabel: 'product', required: true },
      { name: 'qp', label: 'QP / Authorised person', type: 'text' },
      { name: 'qc_complete', label: 'QC complete', type: 'bool' },
      { name: 'deviations_closed', label: 'Deviations closed', type: 'bool' },
      { name: 'release_date', label: 'Release date', type: 'date' },
      { name: 'status', label: 'Status', type: 'select', options: STATUS_OPTIONS.release },
      { name: 'disposition_notes', label: 'Disposition rationale', type: 'textarea', full: true },
    ],
    searchKeys: ['code', 'qp'],
  },

  training_courses: {
    label: 'Training Courses', singular: 'Course', table: 'training_courses', code: 'CRS',
    columns: [
      { key: 'code', label: 'ID', type: 'code' },
      { key: 'title', label: 'Title' },
      { key: 'category', label: 'Category' },
      { key: 'status', label: 'Status', type: 'status' },
    ],
    fields: [
      { name: 'title', label: 'Course title', type: 'text', required: true },
      { name: 'category', label: 'Category', type: 'select', options: ['GMP', 'SOP', 'Safety', 'Technical', 'Onboarding', 'Quality Systems'] },
      { name: 'document_id', label: 'Linked document', type: 'ref', refTable: 'documents', refLabel: 'title' },
      { name: 'status', label: 'Status', type: 'select', options: STATUS_OPTIONS.generic },
      { name: 'description', label: 'Description', type: 'textarea', full: true },
    ],
    searchKeys: ['code', 'title', 'category'],
  },

  training_records: {
    label: 'Training Records', singular: 'Training Record', table: 'training_records', code: 'TRN',
    columns: [
      { key: 'code', label: 'ID', type: 'code' },
      { key: 'trainee', label: 'Trainee' },
      { key: 'course_title', label: 'Course', type: 'ref', refTable: 'training_courses' },
      { key: 'completed_date', label: 'Completed', type: 'date' },
      { key: 'status', label: 'Status', type: 'status' },
    ],
    fields: [
      { name: 'trainee', label: 'Trainee', type: 'text', required: true },
      { name: 'course_id', label: 'Course', type: 'ref', refTable: 'training_courses', refLabel: 'title', required: true },
      { name: 'assigned_date', label: 'Assigned date', type: 'date' },
      { name: 'completed_date', label: 'Completed date', type: 'date' },
      { name: 'score', label: 'Assessment score', type: 'text' },
      { name: 'status', label: 'Status', type: 'select', options: STATUS_OPTIONS.training },
    ],
    searchKeys: ['code', 'trainee'],
  },
}

export const GROUPS = [
  { label: 'Discovery & R&D', icon: 'FlaskConical', items: ['projects', 'eln'] },
  { label: 'Tech Transfer', icon: 'ArrowLeftRight', items: ['tech_transfers'] },
  { label: 'Materials & Supply', icon: 'Boxes', items: ['suppliers', 'materials', 'inventory_lots', 'purchase_orders'] },
  { label: 'Manufacturing', icon: 'Factory', items: ['batches'] },
  { label: 'Quality Control', icon: 'TestTubes', items: ['specifications', 'qc_results'] },
  { label: 'Quality Assurance', icon: 'ShieldCheck', items: ['documents', 'deviations', 'capa', 'change_controls'] },
  { label: 'Equipment & Facilities', icon: 'Wrench', items: ['equipment', 'urs', 'calibrations', 'maintenance'] },
  { label: 'Release', icon: 'BadgeCheck', items: ['releases'] },
  { label: 'People & Training', icon: 'GraduationCap', items: ['training_courses', 'training_records'] },
]

// roles allowed to create/edit/delete (everyone authenticated can read)
export const WRITE_ROLES = ['admin', 'manager', 'analyst']
