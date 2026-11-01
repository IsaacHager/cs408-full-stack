import {Link} from 'react-router-dom';

function AccountButton() {

  return (
    <div className="accountButton">
        <Link to="/profile">
            <div className="text-md text-slate-300 font-medium flex justify-center items-center hover:cursor-pointer p-2 m-2">
                <div className="w-2/3 h-2/3 rounded-full bg-[#c8bfa7] overflow-hidden flex">
                    <img 
                        src="/circle-user-regular-full.svg" 
                        className="w-full h-full object-cover block invert scale-125" 
                        alt="User icon" 
                    />
                </div>
            </div>
        </Link>
    </div>
  );
}

export default AccountButton;