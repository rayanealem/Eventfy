import { motion, AnimatePresence } from 'framer-motion';

export default function FilterTray({ showFilters, activeFilter, setActiveFilter, FILTERS, bgImagePreview }) {
    return (
        <AnimatePresence>
            {showFilters && (
                <motion.div
                    className="story-filter-tray"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                >
                    <div className="filter-scroll">
                        {FILTERS.map(f => (
                            <div
                                key={f.name}
                                className={`filter-item ${activeFilter === f.css ? 'active' : ''}`}
                                onClick={() => setActiveFilter(f.css)}
                            >
                                <div
                                    className="filter-preview"
                                    style={{
                                        backgroundImage: `url(${bgImagePreview})`,
                                        filter: f.css
                                    }}
                                />
                                <span>{f.name}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
