import { NavLink } from 'react-router-dom';

function NavButton({ to, icon, label }) {

  return (
    <div className="navbutton">
      <NavLink
        to={to}
        className={({ isActive }) =>
          `block text-sm text-center p-4 transition-colors ${isActive
            ? "bg-slate-700 text-white shadow-[inset_0_3px_6px_rgba(0,0,0,0.65)]"
            : "text-slate-300 hover:bg-slate-700"
          }`
        }
      >
        <img
          src={icon}
          className="w-1/2 h-1/2 inline-block invert"
          alt={label}
        />
        <br />
        {label}
      </NavLink>
    </div>
  );
}

export default NavButton;