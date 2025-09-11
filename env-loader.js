// Módulo para cargar variables de entorno
class EnvLoader {
    constructor() {
        this.env = {};
        this.loaded = false;
    }

    async loadEnv() {
        if (this.loaded) return this.env;

        try {
            const response = await fetch('.env');
            if (!response.ok) {
                throw new Error('No se pudo cargar el archivo .env');
            }
            
            const envText = await response.text();
            this.parseEnv(envText);
            this.loaded = true;
            
            // Verificar variables requeridas
            this.validateRequiredVars(['SUPABASE_URL', 'SUPABASE_ANON_KEY']);
            
            return this.env;
        } catch (error) {
            console.warn('No se pudo cargar .env, usando valores por defecto:', error.message);
            this.setDefaults();
            return this.env;
        }
    }

    parseEnv(envText) {
        const lines = envText.split('\n');
        
        lines.forEach(line => {
            line = line.trim();
            
            // Ignorar comentarios y líneas vacías
            if (line === '' || line.startsWith('#')) return;
            
            const equalIndex = line.indexOf('=');
            if (equalIndex === -1) return;
            
            const key = line.substring(0, equalIndex).trim();
            let value = line.substring(equalIndex + 1).trim();
            
            // Remover comillas si existen
            if ((value.startsWith('"') && value.endsWith('"')) || 
                (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
            }
            
            this.env[key] = value;
        });
    }

    setDefaults() {
        this.env = {
            SUPABASE_URL: 'https://tzoiscozwjnuxmecwtqi.supabase.co',
            SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6b2lzY296d2pudXhtZWN3dHFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY1NDE1MTQsImV4cCI6MjA1MjExNzUxNH0.sO1zE4Z7vkJeFqYfE1Rts1cJ7IjO0OP6fgxnqTnPXfE',
            TYPEWRITER_SPEED: '8',
            CONTEXT_DURATION: '600000',
            MAX_QUERIES: '5'
        };
        this.loaded = true;
    }

    validateRequiredVars(requiredVars) {
        const missing = requiredVars.filter(key => !this.env[key]);
        if (missing.length > 0) {
            throw new Error(`Variables de entorno faltantes: ${missing.join(', ')}`);
        }
    }

    get(key, defaultValue = null) {
        if (!this.loaded) {
            console.warn('Variables de entorno no cargadas. Llama a loadEnv() primero.');
            return defaultValue;
        }
        return this.env[key] || defaultValue;
    }

    getNumber(key, defaultValue = 0) {
        const value = this.get(key, defaultValue.toString());
        return parseInt(value, 10) || defaultValue;
    }

    getBoolean(key, defaultValue = false) {
        const value = this.get(key, defaultValue.toString()).toLowerCase();
        return value === 'true' || value === '1' || value === 'yes';
    }
}

// Exportar instancia global
window.envLoader = new EnvLoader();