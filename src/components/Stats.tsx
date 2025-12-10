const stats = [
  { value: "8+", label: "New Listings Daily" },
  { value: "10K", label: "Total User Base" },
  { value: "500M", label: "Requested Deal Volume" },
];

const Stats = () => {
  return (
    <section className="py-20 bg-black text-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center animate-scale-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="text-6xl md:text-7xl font-bold mb-4 text-white">
                {stat.value}
              </div>
              <div className="text-xl text-white/80">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
