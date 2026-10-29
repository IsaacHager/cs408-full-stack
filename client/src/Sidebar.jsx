import "./Sidebar.css";
import AccountButton from "./AccountButton";
import NavButton from "./NavButton";

function Sidebar() {

  return (
    <aside className="sidebar relative flex flex-col shrink-0">
      <div className="absolute left-0 -top-48 w-full h-48 bg-[#1b2229] pointer-events-none" />
      <div className="text-md text-slate-300 font-medium text-center">
        <AccountButton />
        <hr></hr>
        <NavButton to="/" icon="/magnifying-glass-solid-full.svg" label="Search" />
        <NavButton to="/" icon="/book-open-solid-full.svg" label="All Drafts" />
        <NavButton to="/" icon="/clipboard-list-solid-full.svg" label="ToDo List" />
        <NavButton to="/" icon="/scroll-solid-full.svg" label="Draft" />
        <NavButton to="/" icon="/paper-plane-solid-full.svg" label="Submit" />
        <NavButton to="/" icon="/thumbtack-solid-full.svg" label="Pinboard" />
      </div>
      <div className="text-md text-slate-300 font-medium text-center mt-auto">
        <NavButton to="/courses" icon="/graduation-cap-solid-full.svg" label="Courses" />
        <NavButton to="/" icon="/ellipsis-solid-full.svg" label="More" />
      </div>
    </aside>
  );
}

export default Sidebar;