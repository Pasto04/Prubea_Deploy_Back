import { PrimaryKey, DateTimeType } from "@mikro-orm/core"

export abstract class BaseClass {
  
  @PrimaryKey()
  codigo?: number


}

export abstract class BaseClass1 {
  
  @PrimaryKey()
  numPlato?: number
}

export abstract class BaseClass2 {
  
  @PrimaryKey()
  id?: number
}

export abstract class BaseClass3{
  @PrimaryKey()
  nroPed?: number 
}

export abstract class BaseClass4{
  @PrimaryKey()
  nroMesa?: number
}

export abstract class BaseClass6{
  @PrimaryKey()
  idTarjeta?: number
}

export abstract class BaseClass7 {
  @PrimaryKey()
  codBebida?: number
}

