function NavButton({icon, label}) {

  return (
    <div className="navbutton">
        <p className="text-sm text-slate-300 font-small text-center hover:bg-slate-700 hover:cursor-pointer p-4">
            <img 
                src={icon} 
                className="w-1/2 h-1/2 inline-block invert" 
                alt={label} 
            />
            <br/>
            {label}
        </p>
    </div>
  );
}

export default NavButton;