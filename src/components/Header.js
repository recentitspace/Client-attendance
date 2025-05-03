const Header = () => (
    <header className="bg-white p-4 shadow flex justify-between items-center">
      <h2 className="text-xl font-semibold text-gray-800">Dashboard</h2>
      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="Search..."
          className="border px-3 py-1 rounded-md text-sm"
        />
        <div className="h-8 w-8 rounded-full bg-gray-300" />
      </div>
    </header>
  );
  
  export default Header;
  