-- Migrate existing user_roles to business_members
-- This ensures that existing users keep their access under the new RBAC system

INSERT INTO public.business_members (business_id, user_id, role, is_active)
SELECT 
    ur.business_id, 
    ur.user_id, 
    COALESCE(ur.role, 'member'), -- Default to member if role is missing
    COALESCE(ur.access_enabled, true) -- Default to true if access_enabled is missing
FROM public.user_roles ur
ON CONFLICT (business_id, user_id) DO UPDATE 
SET role = EXCLUDED.role;

-- Verify migration (Optional check)
-- SELECT count(*) FROM public.business_members;
