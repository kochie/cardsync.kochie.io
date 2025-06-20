-- Match contacts to LinkedIn contacts by name (case-insensitive)
create or replace function match_linkedin_by_name()
returns void
language sql
security definer
as $$
  update contacts
  set linkedin_contact = linkedin_contacts.entity_urn
  from linkedin_contacts
  where contacts.linkedin_contact is null
    and lower(contacts.name) = lower(linkedin_contacts.full_name);
$$;

-- Permissions (optional and recommended)
revoke all on function match_linkedin_by_name from public;
grant execute on function match_linkedin_by_name to authenticated;