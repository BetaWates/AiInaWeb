// ============================================================
// ROLE LAYOUTS
// Thin wrappers that bind each role to BaseLayout
// Separates concerns — each role has its own layout entry point
// ============================================================

import { BaseLayout } from "./BaseLayout";

export const EmployeeLayout  = () => <BaseLayout role="Employee"  />;
export const PurchasingLayout= () => <BaseLayout role="Purchasing"/>;
export const ApproverLayout  = () => <BaseLayout role="Approver"  />;
export const AdminLayout     = () => <BaseLayout role="Admin"     />;
