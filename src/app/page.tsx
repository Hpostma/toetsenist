import Image from "next/image";
import DatapuntenHelper from "@/components/DatapuntenHelper";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="font-bold text-2xl text-han-red tracking-tight">
            HAN
            <span className="text-han-black ml-2 font-normal text-lg">
              University of Applied Sciences
            </span>
          </div>
          <nav className="hidden md:flex space-x-6 text-han-black font-medium">
            <a href="#" className="hover:text-han-red transition-colors">Opleidingen</a>
            <a href="#" className="hover:text-han-red transition-colors">Onderzoek</a>
            <a href="#" className="hover:text-han-red transition-colors">Samenwerken</a>
            <a href="#" className="hover:text-han-red transition-colors">Over de HAN</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow">
        <section className="relative bg-han-gray h-[400px] flex items-center">
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-5xl font-bold text-han-black mb-6 leading-tight">
                CMD Datapunten Helper
              </h1>
              <p className="text-xl text-gray-700 mb-8 max-w-lg">
                Hulp bij het opstellen en controleren van je datapunten voor Cursus 6.
              </p>
            </div>
          </div>
          {/* Abstract background shape/image placeholder */}
          <div className="absolute right-0 top-0 h-full w-1/2 bg-gray-200 hidden lg:block clip-path-slant"></div>
        </section>

        {/* Datapunten Tool Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <DatapuntenHelper />
            </div>
          </div>
        </section>

        {/* Info Section */}
        <section className="py-16 bg-han-gray">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-han-black mb-12 text-center">
              Waarom deze tool?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { title: "Grondigheid", desc: "Check of je aanpak grondig genoeg is volgens de rubric." },
                { title: "Kwaliteit", desc: "Krijg feedback op de kwaliteit van je werk en deliverables." },
                { title: "Bewust Ontwerpen", desc: "Reflecteer op je keuzes en toon aan dat je bewust ontwerpt." }
              ].map((item, index) => (
                <div key={index} className="p-6 bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow rounded-lg">
                  <h3 className="text-xl font-bold text-han-red mb-4">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-han-black text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-bold text-lg mb-4 text-han-red">HAN</h4>
              <p className="text-gray-400 text-sm">
                University of Applied Sciences
              </p>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4">Snel naar</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white">Canvas</a></li>
                <li><a href="#" className="hover:text-white">Onderwijs Online</a></li>
                <li><a href="#" className="hover:text-white">Insite</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4">Contact</h4>
              <p className="text-gray-400 text-sm">
                Vragen over de rubric? Neem contact op met je docent.
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} HAN University of Applied Sciences
          </div>
        </div>
      </footer>
    </div>
  );
}