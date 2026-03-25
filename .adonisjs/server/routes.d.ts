import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'home': { paramsTuple?: []; params?: {} }
    'backoffice.auth.login': { paramsTuple?: []; params?: {} }
    'backoffice.auth.login.store': { paramsTuple?: []; params?: {} }
    'backoffice.auth.reset_password': { paramsTuple?: []; params?: {} }
    'backoffice.auth.reset_password.store': { paramsTuple?: []; params?: {} }
    'backoffice.auth.new_password': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'backoffice.auth.new_password.store': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'backoffice.logout': { paramsTuple?: []; params?: {} }
    'backoffice.dashboard': { paramsTuple?: []; params?: {} }
    'health_checks.live': { paramsTuple?: []; params?: {} }
    'health_checks.ready': { paramsTuple?: []; params?: {} }
  }
  GET: {
    'home': { paramsTuple?: []; params?: {} }
    'backoffice.auth.login': { paramsTuple?: []; params?: {} }
    'backoffice.auth.reset_password': { paramsTuple?: []; params?: {} }
    'backoffice.auth.new_password': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'backoffice.dashboard': { paramsTuple?: []; params?: {} }
    'health_checks.live': { paramsTuple?: []; params?: {} }
    'health_checks.ready': { paramsTuple?: []; params?: {} }
  }
  HEAD: {
    'home': { paramsTuple?: []; params?: {} }
    'backoffice.auth.login': { paramsTuple?: []; params?: {} }
    'backoffice.auth.reset_password': { paramsTuple?: []; params?: {} }
    'backoffice.auth.new_password': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'backoffice.dashboard': { paramsTuple?: []; params?: {} }
    'health_checks.live': { paramsTuple?: []; params?: {} }
    'health_checks.ready': { paramsTuple?: []; params?: {} }
  }
  POST: {
    'backoffice.auth.login.store': { paramsTuple?: []; params?: {} }
    'backoffice.auth.reset_password.store': { paramsTuple?: []; params?: {} }
    'backoffice.auth.new_password.store': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'backoffice.logout': { paramsTuple?: []; params?: {} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}