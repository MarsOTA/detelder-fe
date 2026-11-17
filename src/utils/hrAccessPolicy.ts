// Frontend route affordances match the backend HR role policy.
// All privileged actions still require server-side authorization.
export type HRPermissionRole="ADMIN"|"HR"|"ADMIN_HR";
export const ruoloConsente=(role:string|null|undefined,requested:"ADMIN"|"HR")=>
  role==="ADMIN_HR"||role===requested;
