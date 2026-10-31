# Taste
- When given a reference implementation from another project, wants it used as a reference and adapted to the current codebase — explicitly "not a copy paste". Confidence: 0.85
- Prefers to be asked for any secrets, API keys, or missing inputs needed for the work rather than having the agent guess, invent, or route around them; will supply them on request. Confidence: 0.7
- Judges UI work by look and feel, so expects it to be visually verified (rendered screenshots, both themes and mobile) — not only asserted as building/auditing clean. He reads the rendered page himself and reports layout defects plainly (e.g. text collapsing to one letter per line, sections stretched vertically), so passing checks alone are not accepted as proof it looks right. Confidence: 0.75
- Expects features to be runnable and reviewable on his own machine/preview, not only at the production origin. Confidence: 0.5
- Wants credentials and API keys handled securely by default — pulled from environment variables / local env files rather than pasted into tracked source files. Confidence: 0.6
- Prefers keys to live in an env file that the build reads and bakes in, so a plain local build works — and pushes back when the solution depends on him configuring repository/CI secrets by hand. Confidence: 0.65
- Wants privacy/terms copy to state the blunt position up front in plain language — nothing collected, nothing charged, use at your own risk, no claim honoured — rather than neutral hedged legal prose. Confidence: 0.55
