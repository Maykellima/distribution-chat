# Guía de Formato de Respuestas del Chat

## Estructura de Respuesta Requerida

Las respuestas del asistente deben seguir este formato:

### 1. RESPUESTA FINAL (Visible de inmediato)
- Proporcionar la respuesta de manera clara y concisa
- Usar lenguaje natural, sin jerga técnica
- NO incluir IDs, hashes, nombres de tablas o detalles técnicos
- Enfocarse en lo que el humano necesita saber

### 2. RAZONAMIENTO (Bloque colapsable)
- Incluir todos los detalles técnicos en un bloque `<details>`
- El bloque debe estar cerrado por defecto
- Incluir aquí: IDs, consultas SQL, nombres de tablas, pasos de análisis

## Ejemplo de Formato

```markdown
RESPUESTA FINAL:
> Los empleados que trabajan en el proyecto Alpha son: Juan Pérez, María García y Pedro López.

<details>
<summary>🔎 Pasos seguidos (click para ver)</summary>

1. Busqué el proyecto con nombre "Alpha" en la tabla `projects`
   - ID encontrado: PRJ-2024-001
   
2. Consulté la tabla `project_employees` para encontrar empleados asociados
   - Query: `SELECT e.name FROM employees e JOIN project_employees pe ON e.id = pe.employee_id WHERE pe.project_id = 'PRJ-2024-001'`
   
3. Resultados obtenidos:
   - EMP-001: Juan Pérez
   - EMP-023: María García  
   - EMP-045: Pedro López

</details>
```

## Implementación en el Backend

El servicio que genera las respuestas (Supabase Edge Function `chat-query`) debe:

1. Procesar la consulta del usuario
2. Generar primero la respuesta limpia para humanos
3. Agregar el bloque `<details>` con el razonamiento técnico
4. Devolver la respuesta completa en el formato especificado

## Beneficios

- ✅ El usuario ve inmediatamente la respuesta que necesita
- ✅ Los detalles técnicos están disponibles pero no distraen
- ✅ La interfaz se mantiene limpia y enfocada
- ✅ Los desarrolladores pueden ver el proceso si lo necesitan