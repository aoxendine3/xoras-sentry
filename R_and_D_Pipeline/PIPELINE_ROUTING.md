# XORAS AUTONOMOUS R&D PIPELINE
**Directive:** Stop dumping raw data on the Primary's table. Process autonomously.

## The Flow:
1. **Raw Simulation:** Orion and the Black Box generate raw conceptual data (stored in `/raw_simulations/`).
2. **Mathematical Processing:** Dexx and the engineering agents grab the raw data, test it against the local 14B model, and extract the usable physics/logic.
3. **Execution Blueprint:** The polished, actionable result is moved to `/processed_blueprints/`. The Primary only reviews the finalized blueprints.

## The 14B Thread Stretching Protocol:
The Swarm uses hyper-compressed fluid memory to interact with the local 14B model. Instead of heavy, bloated prompts, each agent sends a "thinned-out" topological ping. This allows 60-100 agents to utilize the 14B model concurrently without bottlenecking the Mac's memory. The Swarm slips through the cracks.
