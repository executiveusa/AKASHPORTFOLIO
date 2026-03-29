//! El Panorama™ Integration Tests
//! Run: cargo test -- --test-threads=1

#[cfg(test)]
mod tests {
    use rusqlite::Connection;

    fn test_db() -> Connection {
        let conn = Connection::open_in_memory().unwrap();
        let schema = include_str!("../src/db/schema.sql");
        conn.execute_batch(schema).unwrap();
        conn
    }

    #[test]
    fn test_schema_applies_clean() {
        let db = test_db();
        // Schema must be idempotent — run twice
        let schema = include_str!("../src/db/schema.sql");
        db.execute_batch(schema).unwrap();
        println!("✅ Schema idempotent");
    }

    #[test]
    fn test_seed_data_present() {
        let db = test_db();
        let count: i64 = db.query_row(
            "SELECT COUNT(*) FROM ep_esferas", [], |r| r.get(0)
        ).unwrap();
        assert!(count >= 4, "Expected 4 seed esferas, got {}", count);
        println!("✅ Seed data: {} esferas", count);
    }

    #[test]
    fn test_mision_tables_created() {
        let db = test_db();
        // Verify tables exist
        let tables: Vec<String> = db.prepare(
            "SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'ep_%'"
        )
        .unwrap()
        .query_map([], |r| r.get(0))
        .unwrap()
        .filter_map(|r| r.ok())
        .collect();

        assert!(tables.contains(&"ep_misiones".to_string()), "ep_misiones table missing");
        assert!(tables.contains(&"ep_esferas".to_string()), "ep_esferas table missing");
        println!("✅ All {} El Panorama™ tables created", tables.len());
    }

    #[test]
    fn test_atomic_checkout_isolation() {
        let db = test_db();
        // Create misión
        db.execute(
            "INSERT INTO ep_misiones (id,titulo,estado,prioridad,tokens_usados,creado_en,actualizado_en)
             VALUES ('m1','Checkout Test','proximo','alta',0,datetime('now'),datetime('now'))",
            []
        ).unwrap();

        // First checkout
        db.execute(
            "UPDATE ep_misiones SET estado='en_ronda', run_id_actual='run-A' WHERE id='m1' AND run_id_actual IS NULL",
            []
        ).unwrap();

        // Verify run-A owns it
        let run: Option<String> = db.query_row(
            "SELECT run_id_actual FROM ep_misiones WHERE id='m1'", [], |r| r.get(0)
        ).unwrap();
        assert_eq!(run.as_deref(), Some("run-A"));

        // Second checkout attempt (run-B) — should find run_id_actual = run-A
        let rows = db.execute(
            "UPDATE ep_misiones SET run_id_actual='run-B' WHERE id='m1' AND run_id_actual IS NULL",
            []
        ).unwrap();
        assert_eq!(rows, 0, "Second checkout must not update — already owned by run-A");
        println!("✅ Atomic checkout conflict detection works");
    }

    #[test]
    fn test_presupuesto_aggregation() {
        let db = test_db();
        // Insert some latidos
        db.execute_batch(
            "INSERT INTO ep_latidos (id,esfera_id,run_id,tokens_gastados,creado_en)
            VALUES ('l1','synthia-prime','r1',5000,datetime('now')),
                   ('l2','synthia-prime','r2',3000,datetime('now'))"
        ).unwrap();

        let total: i64 = db.query_row(
            "SELECT COALESCE(SUM(tokens_gastados),0) FROM ep_latidos WHERE date(creado_en)=date('now')",
            [], |r| r.get(0)
        ).unwrap();
        assert_eq!(total, 8000);
        println!("✅ Presupuesto aggregation: {} tokens today", total);
    }

    #[test]
    fn test_constelacion_structure() {
        let db = test_db();
        // All seed esferas except synthia-prime should have reporta_a set
        let orphans: i64 = db.query_row(
            "SELECT COUNT(*) FROM ep_esferas WHERE reporta_a IS NULL AND id != 'synthia-prime'",
            [], |r| r.get(0)
        ).unwrap();
        assert_eq!(orphans, 0, "All non-root esferas must report to someone");
        println!("✅ Constellation: all esferas connected");
    }

    #[test]
    fn test_indexes_exist() {
        let db = test_db();
        let indexes: Vec<String> = db.prepare(
            "SELECT name FROM sqlite_master WHERE type='index' AND name LIKE 'idx_%'"
        )
        .unwrap()
        .query_map([], |r| r.get(0))
        .unwrap()
        .filter_map(|r| r.ok())
        .collect();

        assert!(!indexes.is_empty(), "No indexes found");
        println!("✅ Database indexes: {}", indexes.len());
    }
}
