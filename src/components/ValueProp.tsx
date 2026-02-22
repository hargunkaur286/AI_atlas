import { motion } from "framer-motion";
import { Brain, Users, Shield } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Intelligent Profiling",
    description: "Our AI deeply understands each participant — their role, interests, investment thesis, and strategic goals.",
  },
  {
    icon: Users,
    title: "Precision Matching",
    description: "Every meeting is deliberate. We surface the connections that matter most to your objectives.",
  },
  {
    icon: Shield,
    title: "Institutional Grade",
    description: "Built for the highest echelon of decision makers in digital assets, with confidentiality at its core.",
  },
];

const ValueProp = () => {
  return (
    <section className="py-24 md:py-32">
      <div className="container mx-auto px-8 md:px-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-serif mb-4">
            Not Just Networking.{" "}
            <span className="text-primary italic">Strategic Architecture.</span>
          </h2>
          <p className="text-muted-foreground font-sans max-w-2xl mx-auto">
            Atlas doesn't just connect people — it understands who you are, what you need, and orchestrates the meetings that move markets.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="group p-8 rounded-lg border border-border/50 bg-card/30 hover:border-primary/30 hover:bg-card/60 transition-all duration-500"
            >
              <feature.icon className="w-8 h-8 text-primary mb-6 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="text-xl font-serif mb-3 text-foreground">{feature.title}</h3>
              <p className="text-sm font-sans text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ValueProp;
