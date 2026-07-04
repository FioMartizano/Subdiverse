function GrievanceComplaint() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold">Grievance Complaint</h1>
      <p>This is the Grievance Complaint page.</p>
    </div>

   
  );
}
export default GrievanceComplaint;

 /* 4. COMPLAINT ROADMAP SECTION 
            <section className="w-full py-20 bg-gray-50 px-6 md:px-24">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-black)] mb-12">
                        How the Complaint Process Works
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {[
                            { id: "01", title: "Submission", desc: "The complainer submits details about the issue and the person involved." },
                            { id: "02", title: "Mediation Call", desc: "The grievance officer contacts both parties to initiate the process." },
                            { id: "03", title: "Escalation", desc: "If the respondent fails to appear after three invitations, the matter is referred to the Barangay." },
                            { id: "04", title: "Resolution", desc: "If the respondent attends, the officer mediates a face-to-face conversation to resolve the issue." }
                        ].map((step, index) => (
                            <motion.div
                                key={step.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.15 }}
                                className="relative border-t-4 border-[var(--color-primary)] pt-6"
                            >
                                <span className="text-[var(--color-secondary)] font-bold text-xl block mb-2">{step.id}</span>
                                <h3 className="text-lg font-bold text-[var(--color-black)] mb-2">{step.title}</h3>
                                <p className="text-zinc-600 text-sm leading-relaxed">{step.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section> */