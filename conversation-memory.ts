// conversation-memory.ts
export interface ConversationContext {
    lastQuery: string;
    lastAnswer: string;
    entities: {
      people: string[];
      projects: string[];
      technologies: string[];
      departments: string[];
    };
    timestamp: number;
  }
  
  export class ConversationMemory {
    private context: ConversationContext | null = null;
    private readonly CONTEXT_DURATION = 10 * 60 * 1000; // 10 minutos
  
    updateContext(query: string, answer: string) {
      // Extraer entidades mencionadas
      const entities = this.extractEntities(query, answer);
      
      this.context = {
        lastQuery: query,
        lastAnswer: answer,
        entities,
        timestamp: Date.now()
      };
    }
  
    private extractEntities(query: string, answer: string): any {
      const combined = (query + ' ' + answer).toLowerCase();
      
      return {
        people: this.extractNames(combined),
        projects: this.extractProjects(combined),
        technologies: [],
        departments: []
      };
    }
  
    private extractNames(text: string): string[] {
      const names: string[] = [];
      // Patrón para detectar nombres propios
      const namePattern = /\b[A-ZÁÉÍÓÚ][a-záéíóú]+ [A-ZÁÉÍÓÚ][a-záéíóú]+\b/g;
      const matches = text.match(namePattern);
      return matches || [];
    }
  
    private extractProjects(text: string): string[] {
      const projects: string[] = [];
      // Proyectos conocidos
      const knownProjects = ['dataverse', 'delta', 'sid', 'hornblower'];
      knownProjects.forEach(p => {
        if (text.includes(p)) projects.push(p);
      });
      return projects;
    }
  
    enhanceQuery(newQuery: string): string {
      if (!this.context || Date.now() - this.context.timestamp > this.CONTEXT_DURATION) {
        return newQuery;
      }
  
      const q = newQuery.toLowerCase();
      
      // Detectar referencias contextuales
      if (q.includes('ellos') || q.includes('estos') || q.includes('esos')) {
        if (this.context.entities.people.length > 0) {
          return newQuery + ` (contexto: hablábamos de ${this.context.entities.people.join(', ')})`;
        }
      }
      
      if (q.includes('ese proyecto') || q.includes('el proyecto')) {
        if (this.context.entities.projects.length > 0) {
          return newQuery + ` (contexto: proyecto ${this.context.entities.projects[0]})`;
        }
      }
      
      // Si menciona "senior" sin contexto de personas
      if ((q.includes('senior') || q.includes('junior')) && !q.includes('empleado')) {
        if (this.context.lastQuery.includes('empleado') || this.context.lastQuery.includes('proyecto')) {
          return newQuery + ` (contexto: ${this.context.lastQuery})`;
        }
      }
      
      return newQuery;
    }
  
    getContext(): ConversationContext | null {
      if (!this.context || Date.now() - this.context.timestamp > this.CONTEXT_DURATION) {
        return null;
      }
      return this.context;
    }
  
    clear() {
      this.context = null;
    }
  }