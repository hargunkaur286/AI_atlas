import { motion } from "framer-motion";

const stats = [
  { value: "2,500+", label: "Decision Makers" },
  { value: "AI", label: "Precision Matching" },
  { value: "150+", label: "Institutions" },
  { value: "1:1", label: "Curated Meetings" },
];

const StatsBar = () => {
  return (
    <section className="relative border-t border-border/50 bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-8 md:px-16 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center"
            >
              <div className="text-3xl md:text-4xl font-serif text-primary mb-2">
                {stat.value}
              </div>
              <div className="text-xs font-sans tracking-widest uppercase text-muted-foreground">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsBar;
