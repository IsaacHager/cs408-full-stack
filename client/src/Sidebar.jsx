import "./Sidebar.css";
import AccountButton from "./AccountButton";
import NavButton from "./NavButton";

function Sidebar() {

  return (
    <aside className="sidebar flex flex-col h-screen shrink-0 overflow-y-auto self-start">
        <div className="text-md text-slate-300 font-medium text-center">
            <AccountButton />
            <hr></hr>
            <NavButton icon="/magnifying-glass-solid-full.svg" label="Search" />
            <NavButton icon="/book-open-solid-full.svg" label="All Drafts" />
            <NavButton icon="/clipboard-list-solid-full.svg" label="ToDo List" />
            <NavButton icon="/scroll-solid-full.svg" label="Draft" />
            <NavButton icon="/paper-plane-solid-full.svg" label="Submit" />
            <NavButton icon="/thumbtack-solid-full.svg" label="Pinboard" />
        </div>
        <div className="text-md text-slate-300 font-medium text-center mt-auto">
            <NavButton icon="/graduation-cap-solid-full.svg" label="Courses" />
            <NavButton icon="/ellipsis-solid-full.svg" label="More" />
        </div>
    </aside>
  );
}

export default Sidebar;