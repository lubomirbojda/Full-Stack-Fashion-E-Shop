const pool = require('./db');

const initDb = async () => {
  try {
    await pool.query(`
        -- Funkcia pre trigger
        CREATE OR REPLACE FUNCTION public.reset_sequence_after_delete()
        RETURNS TRIGGER AS $$
        BEGIN
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        -- Tabuľky s automatickými sekvenciami (SERIAL) a primárnymi kľúčmi
        CREATE TABLE IF NOT EXISTS public.polozka (
            id serial PRIMARY KEY,
            nazov text NOT NULL,
            popis text,
            cena numeric(10,2) NOT NULL,
            pocet_ks integer NOT NULL
        );

        CREATE TABLE IF NOT EXISTS public.pouzivatelia (
            id serial PRIMARY KEY,
            email text NOT NULL UNIQUE,
            password text NOT NULL,
            role text NOT NULL
        );

        CREATE TABLE IF NOT EXISTS public.obrazky (
            id serial PRIMARY KEY,
            polozka_id integer NOT NULL REFERENCES public.polozka(id),
            cesta text NOT NULL
        );

        CREATE TABLE IF NOT EXISTS public.kosik (
            pouzivatel_id integer NOT NULL REFERENCES public.pouzivatelia(id) ON DELETE CASCADE,
            polozka_id integer NOT NULL REFERENCES public.polozka(id) ON DELETE CASCADE,
            pocet_ks integer DEFAULT 0 NOT NULL,
            PRIMARY KEY (pouzivatel_id, polozka_id)
        );

        -- Trigger
        DROP TRIGGER IF EXISTS reset_sequence_after_delete_trigger ON public.polozka;
        CREATE TRIGGER reset_sequence_after_delete_trigger 
        AFTER DELETE ON public.polozka 
        FOR EACH STATEMENT 
        EXECUTE FUNCTION public.reset_sequence_after_delete();
    `);

    console.log('Tabuľky úspešne inicializované.');
  } catch (err) {
    console.error('Chyba pri inicializácii tabuliek:', err);
  } finally {
    pool.end();
  }
};

initDb();