"use client";

import { Avatar } from "@/components/ui/avatar";
import {
  Dropdown,
  DropdownButton,
  DropdownDivider,
  DropdownItem,
  DropdownLabel,
  DropdownMenu,
} from "@/components/ui/dropdown";
import { Heading } from "@/components/ui/heading";
import {
  Navbar,
  NavbarItem,
  NavbarSection,
  NavbarSpacer,
} from "@/components/ui/navbar";
import {
  Sidebar,
  SidebarBody,
  SidebarDivider,
  SidebarFooter,
  SidebarHeader,
  SidebarItem,
  SidebarLabel,
  SidebarSection,
  SidebarSpacer,
} from "@/components/ui/sidebar";
import { SidebarLayout } from "@/components/ui/sidebar-layout";
import { useAuth } from "@/context/AuthProvider";
import {
  faRightFromBracket,
  faChevronUp,
  faGear,
  faLightbulb,
  faShieldHalved,
  faUser,
  faInbox,
  faMagnifyingGlass,
  faUsers,
  faAddressBook,
  faPeopleArrows,
  faUserGroup,
  faPeopleGroup,
  faServer,
  faCircleQuestion,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
  children, // This is the page content that will be rendered inside the layout
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const path = usePathname();

  return (
    <SidebarLayout
      navbar={
        <Navbar>
          <NavbarSpacer />
          <NavbarSection>
            <NavbarItem href="/search" aria-label="Search">
              <FontAwesomeIcon icon={faMagnifyingGlass} />
            </NavbarItem>
            <NavbarItem href="/inbox" aria-label="Inbox">
              <FontAwesomeIcon icon={faInbox} />
            </NavbarItem>
            <Dropdown>
              <DropdownButton as={NavbarItem}>
                <Avatar src="/profile-photo.jpg" square />
              </DropdownButton>
              <DropdownMenu className="min-w-64" anchor="bottom end">
                <DropdownItem href="/my-profile">
                  <FontAwesomeIcon icon={faUser} />
                  <DropdownLabel>My profile</DropdownLabel>
                </DropdownItem>
                <DropdownItem href="/settings">
                  <FontAwesomeIcon icon={faGear} />
                  <DropdownLabel>Settings</DropdownLabel>
                </DropdownItem>
                <DropdownDivider />
                <DropdownItem href="/privacy-policy">
                  <FontAwesomeIcon icon={faShieldHalved} />
                  <DropdownLabel>Privacy policy</DropdownLabel>
                </DropdownItem>
                <DropdownItem href="/share-feedback">
                  <FontAwesomeIcon icon={faLightbulb} />
                  <DropdownLabel>Share feedback</DropdownLabel>
                </DropdownItem>
                <DropdownDivider />
                <DropdownItem href="/logout">
                  <FontAwesomeIcon
                    fixedWidth
                    className="mr-2"
                    icon={faRightFromBracket}
                  />
                  <DropdownLabel>Sign out</DropdownLabel>
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </NavbarSection>
        </Navbar>
      }
      sidebar={
        <Sidebar>
          <SidebarHeader>
            <Heading className="flex gap-2 items-center">
              <FontAwesomeIcon icon={faUserGroup} />
              ContactSync
            </Heading>
          </SidebarHeader>
          <SidebarBody>
            <SidebarSection>
              <SidebarItem
                href="/dashboard/contacts"
                current={path.startsWith("/dashboard/contacts")}
              >
                <FontAwesomeIcon fixedWidth icon={faUsers} />
                <SidebarLabel>Contacts</SidebarLabel>
              </SidebarItem>
              <SidebarItem
                href="/dashboard/groups"
                current={path.startsWith("/dashboard/groups")}
              >
                <FontAwesomeIcon fixedWidth icon={faPeopleGroup} />
                <SidebarLabel>Groups</SidebarLabel>
              </SidebarItem>
              <SidebarItem
                href="/dashboard/addressbooks"
                current={path.startsWith("/dashboard/addressbooks")}
              >
                <FontAwesomeIcon fixedWidth icon={faAddressBook} />
                <SidebarLabel>Address Books</SidebarLabel>
              </SidebarItem>
            </SidebarSection>
            <SidebarDivider />
            <SidebarSection>
              <SidebarItem
                href="/dashboard/carddav"
                current={path.startsWith("/dashboard/carddav")}
              >
                <FontAwesomeIcon fixedWidth icon={faServer} />
                <SidebarLabel>CardDAV Servers</SidebarLabel>
              </SidebarItem>
              <SidebarItem
                href="/dashboard/connections"
                current={path.startsWith("/dashboard/connections")}
              >
                <FontAwesomeIcon fixedWidth icon={faPeopleArrows} />
                <SidebarLabel>Social Connections</SidebarLabel>
              </SidebarItem>
            </SidebarSection>
            <SidebarSpacer />
            <SidebarSection>
                <SidebarItem
                    href="/dashboard/support"
                    current={path.startsWith("/dashboard/support")}
                >
                    <FontAwesomeIcon fixedWidth icon={faCircleQuestion} />
                    <SidebarLabel>Support</SidebarLabel>
                </SidebarItem>
            </SidebarSection>
          </SidebarBody>
          <SidebarFooter className="max-lg:hidden">
            <Dropdown>
              <DropdownButton as={SidebarItem}>
                <span className="flex min-w-0 items-center gap-3">
                  <Avatar
                    src={user?.photoURL}
                    className="size-10"
                    square
                    alt=""
                    initials={user?.displayName ?? ""}
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-sm/5 font-medium text-zinc-950 dark:text-white">
                      {user?.displayName}
                    </span>
                    <span className="block truncate text-xs/5 font-normal text-zinc-500 dark:text-zinc-400">
                      {user?.email}
                    </span>
                  </span>
                </span>
                <FontAwesomeIcon icon={faChevronUp} />
              </DropdownButton>
              <DropdownMenu className="min-w-64" anchor="top start">
                <DropdownItem href="/dashboard/profile">
                  <FontAwesomeIcon icon={faUser} />
                  <DropdownLabel>My profile</DropdownLabel>
                </DropdownItem>
                <DropdownItem href="/settings">
                  <FontAwesomeIcon icon={faGear} />
                  <DropdownLabel>Settings</DropdownLabel>
                </DropdownItem>
                <DropdownDivider />
                <DropdownItem href="/privacy-policy">
                  <FontAwesomeIcon icon={faShieldHalved} />
                  <DropdownLabel>Privacy policy</DropdownLabel>
                </DropdownItem>
                <DropdownItem href="/share-feedback">
                  <FontAwesomeIcon icon={faLightbulb} />
                  <DropdownLabel>Share feedback</DropdownLabel>
                </DropdownItem>
                <DropdownDivider />
                <DropdownItem href="/logout" className="flex gap-2">
                  <FontAwesomeIcon icon={faRightFromBracket} />
                  <DropdownLabel>Sign out</DropdownLabel>
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </SidebarFooter>
        </Sidebar>
      }
    >
      {children}
    </SidebarLayout>
  );
}
