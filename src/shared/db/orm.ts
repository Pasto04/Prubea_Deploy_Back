import { MikroORM } from '@mikro-orm/core'
import { MySqlDriver } from '@mikro-orm/mysql' // Asegúrate de tener instalado @mikro-orm/mysql
import { SqlHighlighter } from '@mikro-orm/sql-highlighter'

export const orm = await MikroORM.init({
  entities: ['dist/**/*.entity.js'],
  entitiesTs: ['src/**/*entity.ts'],
  
  // dbName: 'restaurante_dsw', // Comentado: Dejamos que la URL completa defina la DB
  type: 'mysql',
  driver: MySqlDriver, // Es buena práctica especificar el driver explícitamente

  // 🚀 CAMBIO CRÍTICO PARA DEPLOY:
  // Usa la variable de entorno de Render si existe, sino usa localhost
  clientUrl: process.env.DATABASE_URL || 'mysql://root:root@localhost:3306/restaurante_dsw',
  
  highlighter: new SqlHighlighter(),
  debug: true, // Puedes poner process.env.NODE_ENV !== 'production' si quieres menos logs en prod
  
  schemaGenerator: {
    disableForeignKeys: true,
    createForeignKeyConstraints: true,
    ignoreSchema: [],
  },
});

export const syncSchema = async () => {
  const generator = orm.getSchemaGenerator()
  /*
  await generator.dropSchema();
  await generator.createSchema();
  */
  // Esto creará/actualizará tus tablas en Aiven automáticamente al iniciar
  await generator.updateSchema()
};