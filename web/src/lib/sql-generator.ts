import { Table, Column } from "@/types";

// Fungsi helper untuk memetakan tipe data umum ke tipe data SQL
const mapTypeToSql = (type: string): string => {
  const upperType = type.toUpperCase();
  switch (upperType) {
    case "UUID":
      return "UUID";
    case "TEXT":
      return "TEXT";
    case "TIMESTAMPZ":
      return "TIMESTAMP WITH TIME ZONE";
    case "INTEGER":
      return "INTEGER";
    case "BOOLEAN":
      return "BOOLEAN";
    case "JSONB":
      return "JSONB";
    case "NUMERIC":
      return "NUMERIC";
    default:
      // Mempertahankan tipe seperti VARCHAR(255)
      if (upperType.startsWith("VARCHAR")) {
        return upperType;
      }
      return "TEXT"; // Fallback default
  }
};

export const jsonToSql = (schema: Table[]): string => {
  let finalSqlString = `/**\n * Auto-generated SQL schema from Idea Generator\n * Timestamp: ${new Date().toISOString()}\n */\n\n`;

  schema.forEach((table) => {
    const columnsSql: string[] = [];
    const constraintsSql: string[] = [];

    table.columns.forEach((col) => {
      let colString = `  "${col.name}" ${mapTypeToSql(col.type)}`;
      if (col.is_primary_key) {
        colString += " PRIMARY KEY";
      }
      // Menambahkan UNIQUE constraint jika ada di data
      if ((col as any).is_unique) {
        colString += " UNIQUE";
      }
      columnsSql.push(colString);

      // Mengumpulkan foreign key untuk ditambahkan sebagai constraint di akhir
      const colWithFk = col as Column & { references?: string };
      if (colWithFk.references) {
        const targetMatch = colWithFk.references.match(/^(\w+)\((\w+)\)/);
        if (targetMatch && targetMatch[1] && targetMatch[2]) {
          const targetTable = targetMatch[1];
          const targetColumn = targetMatch[2];
          constraintsSql.push(
            `  CONSTRAINT fk_${table.table_name}_${col.name} FOREIGN KEY ("${col.name}") REFERENCES "${targetTable}" ("${targetColumn}")`
          );
        }
      }
    });

    finalSqlString += `CREATE TABLE "${table.table_name}" (\n`;
    finalSqlString += columnsSql.join(",\n");
    if (constraintsSql.length > 0) {
      finalSqlString += ",\n" + constraintsSql.join(",\n");
    }
    finalSqlString += "\n);\n\n";
  });

  return finalSqlString.trim();
};
