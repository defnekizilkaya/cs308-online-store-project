// backend/src/db/migrations/20251128150000_add_product_details_fields.js

exports.up = async function (knex) {
    // 1) model ve serial_number kolonlarının tipini netleştir (VARCHAR(100))
    await knex.schema.alterTable('products', (t) => {
      t.string('model', 100).alter();
      t.string('serial_number', 100).alter(); // zaten unique, sadece boyut
    });
  
    // 2) warranty_status şu anda boolean; bunu saklamak için rename edip
    //    string warranty_status ekleyeceğiz
    await knex.schema.alterTable('products', (t) => {
      t.renameColumn('warranty_status', 'warranty_bool'); // eski boolean
    });
  
    // Yeni string warranty_status kolonu
    await knex.schema.alterTable('products', (t) => {
      t.string('warranty_status', 50).notNullable().defaultTo('none');
    });
  
    // Eskiden true olanlar -> 'active', diğerleri -> 'none'
    await knex('products').update(
      'warranty_status',
      knex.raw("CASE WHEN warranty_bool THEN 'active' ELSE 'none' END")
    );
  
    // 3) distributor => distributor_info + TEXT
    await knex.schema.alterTable('products', (t) => {
      t.renameColumn('distributor', 'distributor_info');
    });
  
    await knex.schema.alterTable('products', (t) => {
      t.text('distributor_info').alter();
    });
  };
  
  exports.down = async function (knex) {
    // distributor_info'u eski ismine döndür
    await knex.schema.alterTable('products', (t) => {
      t.renameColumn('distributor_info', 'distributor');
    });
  
    // string warranty_status'u sil
    await knex.schema.alterTable('products', (t) => {
      t.dropColumn('warranty_status');
    });
  
    // boolean warranty_bool'u tekrar warranty_status ismine döndür
    await knex.schema.alterTable('products', (t) => {
      t.renameColumn('warranty_bool', 'warranty_status');
    });
  
    // model/serial_number tipini geri çevirmeye gerek yok (compatible)
  };  