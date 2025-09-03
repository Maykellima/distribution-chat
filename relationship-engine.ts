// relationship-engine.ts
export interface TableRelation {
    sourceTable: string;
    sourceColumn: string;
    targetTable: string;
    targetColumn: string;
  }
  
  export interface QueryPath {
    tables: string[];
    joins: Array<{
      from: string;
      to: string;
      fromColumn: string;
      toColumn: string;
    }>;
  }
  
  export class RelationshipEngine {
    private relations: TableRelation[] = [];
    private graph: Map<string, Map<string, TableRelation>> = new Map();
  
    constructor(foreignKeys: any[]) {
      this.relations = foreignKeys;
      this.buildGraph();
    }
  
    private buildGraph() {
      // Construir grafo bidireccional de relaciones
      for (const rel of this.relations) {
        // Forward direction
        if (!this.graph.has(rel.sourceTable)) {
          this.graph.set(rel.sourceTable, new Map());
        }
        this.graph.get(rel.sourceTable)!.set(rel.targetTable, rel);
        
        // Reverse direction para navegación bidireccional
        if (!this.graph.has(rel.targetTable)) {
          this.graph.set(rel.targetTable, new Map());
        }
        this.graph.get(rel.targetTable)!.set(rel.sourceTable, {
          sourceTable: rel.targetTable,
          sourceColumn: rel.targetColumn,
          targetTable: rel.sourceTable,
          targetColumn: rel.sourceColumn
        });
      }
    }
  
    findPath(fromTable: string, toTable: string): QueryPath | null {
      if (fromTable === toTable) {
        return { tables: [fromTable], joins: [] };
      }
  
      // BFS para encontrar el camino más corto
      const queue: Array<{table: string, path: string[], joins: any[]}> = [
        {table: fromTable, path: [fromTable], joins: []}
      ];
      const visited = new Set<string>();
  
      while (queue.length > 0) {
        const current = queue.shift()!;
        
        if (visited.has(current.table)) continue;
        visited.add(current.table);
  
        const neighbors = this.graph.get(current.table);
        if (!neighbors) continue;
  
        for (const [neighbor, relation] of neighbors) {
          if (visited.has(neighbor)) continue;
  
          const newPath = [...current.path, neighbor];
          const newJoin = {
            from: current.table,
            to: neighbor,
            fromColumn: relation.sourceColumn,
            toColumn: relation.targetColumn
          };
          const newJoins = [...current.joins, newJoin];
  
          if (neighbor === toTable) {
            return { tables: newPath, joins: newJoins };
          }
  
          queue.push({
            table: neighbor,
            path: newPath,
            joins: newJoins
          });
        }
      }
  
      return null;
    }
  
    buildJoinQuery(path: QueryPath, selectColumns?: string[]): string {
      if (path.tables.length === 1) {
        return `SELECT * FROM ${path.tables[0]}`;
      }
  
      const select = selectColumns?.join(', ') || '*';
      let query = `SELECT ${select} FROM ${path.tables[0]}`;
      
      for (const join of path.joins) {
        query += ` JOIN ${join.to} ON ${join.from}.${join.fromColumn} = ${join.to}.${join.toColumn}`;
      }
  
      return query;
    }
  
    detectRequiredTables(question: string, schema: any): string[] {
      const q = question.toLowerCase();
      const tables = new Set<string>();
      
      // Mapeo de palabras clave a tablas
      const keywords: Record<string, string[]> = {
        'people': ['empleado', 'persona', 'quien', 'equipo', 'staff'],
        'projects': ['proyecto', 'project'],
        'technologies': ['tecnologia', 'tech', 'skill'],
        'departments': ['departamento', 'area', 'depto'],
        'clients': ['cliente', 'client'],
        'vacancies': ['vacante', 'puesto', 'posicion'],
        'candidates': ['candidato', 'postulante']
      };
  
      // Detectar tablas mencionadas
      for (const [table, words] of Object.entries(keywords)) {
        if (words.some(w => q.includes(w))) {
          tables.add(table);
        }
      }
  
      // Si menciona relaciones, agregar tablas intermedias
      if (q.includes('trabaja') || q.includes('asignado') || q.includes('proyecto')) {
        if (tables.has('people') && tables.has('projects')) {
          tables.add('project_people');
        }
      }
  
      if (q.includes('tecnologia') || q.includes('skill')) {
        if (tables.has('people')) {
          tables.add('people_technologies');
        }
        if (tables.has('projects')) {
          tables.add('project_technologies');
        }
      }
  
      return Array.from(tables);
    }
  }