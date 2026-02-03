import { MikroORM } from '@mikro-orm/core'
import { MySqlDriver } from '@mikro-orm/mysql' // Asegúrate de tener instalado @mikro-orm/mysql
import { SqlHighlighter } from '@mikro-orm/sql-highlighter'

export const orm = await MikroORM.init({
  entities: ['dist/**/*.entity.js'],
  entitiesTs: ['src/**/*entity.ts'],
  
  type: 'mysql',
  driver: MySqlDriver, 


  clientUrl: process.env.DATABASE_URL || 'mysql://root:root@localhost:3306/restaurante_dsw',
  
  highlighter: new SqlHighlighter(),
  debug: true,
  
  schemaGenerator: {
    disableForeignKeys: true,
    createForeignKeyConstraints: true,
    ignoreSchema: [],
  },
});

export const syncSchema = async () => {
  const generator = orm.getSchemaGenerator()

  await generator.updateSchema()
};