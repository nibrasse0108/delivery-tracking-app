import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'home': { paramsTuple?: []; params?: {} }
    'packages.receipt': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'backoffice.auth.login': { paramsTuple?: []; params?: {} }
    'backoffice.auth.login.store': { paramsTuple?: []; params?: {} }
    'backoffice.auth.reset_password': { paramsTuple?: []; params?: {} }
    'backoffice.auth.reset_password.store': { paramsTuple?: []; params?: {} }
    'backoffice.auth.new_password': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'backoffice.auth.new_password.store': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'backoffice.logout': { paramsTuple?: []; params?: {} }
    'backoffice.dashboard': { paramsTuple?: []; params?: {} }
    'backoffice.clients.index': { paramsTuple?: []; params?: {} }
    'backoffice.clients.create': { paramsTuple?: []; params?: {} }
    'backoffice.clients.store': { paramsTuple?: []; params?: {} }
    'backoffice.clients.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'backoffice.clients.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'backoffice.clients.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'backoffice.packages.index': { paramsTuple?: []; params?: {} }
    'backoffice.packages.create': { paramsTuple?: []; params?: {} }
    'backoffice.packages.store': { paramsTuple?: []; params?: {} }
    'backoffice.packages.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'backoffice.packages.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'backoffice.packages.advance_status': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'backoffice.packages.record_payment': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'backoffice.packages.upload_photo': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'backoffice.packages.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'backoffice.admins.index': { paramsTuple?: []; params?: {} }
    'backoffice.admins.create': { paramsTuple?: []; params?: {} }
    'backoffice.admins.store': { paramsTuple?: []; params?: {} }
    'backoffice.admins.toggle': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'backoffice.admins.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'health_checks.live': { paramsTuple?: []; params?: {} }
    'health_checks.ready': { paramsTuple?: []; params?: {} }
  }
  GET: {
    'home': { paramsTuple?: []; params?: {} }
    'packages.receipt': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'backoffice.auth.login': { paramsTuple?: []; params?: {} }
    'backoffice.auth.reset_password': { paramsTuple?: []; params?: {} }
    'backoffice.auth.new_password': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'backoffice.dashboard': { paramsTuple?: []; params?: {} }
    'backoffice.clients.index': { paramsTuple?: []; params?: {} }
    'backoffice.clients.create': { paramsTuple?: []; params?: {} }
    'backoffice.clients.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'backoffice.packages.index': { paramsTuple?: []; params?: {} }
    'backoffice.packages.create': { paramsTuple?: []; params?: {} }
    'backoffice.packages.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'backoffice.admins.index': { paramsTuple?: []; params?: {} }
    'backoffice.admins.create': { paramsTuple?: []; params?: {} }
    'health_checks.live': { paramsTuple?: []; params?: {} }
    'health_checks.ready': { paramsTuple?: []; params?: {} }
  }
  HEAD: {
    'home': { paramsTuple?: []; params?: {} }
    'packages.receipt': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'backoffice.auth.login': { paramsTuple?: []; params?: {} }
    'backoffice.auth.reset_password': { paramsTuple?: []; params?: {} }
    'backoffice.auth.new_password': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'backoffice.dashboard': { paramsTuple?: []; params?: {} }
    'backoffice.clients.index': { paramsTuple?: []; params?: {} }
    'backoffice.clients.create': { paramsTuple?: []; params?: {} }
    'backoffice.clients.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'backoffice.packages.index': { paramsTuple?: []; params?: {} }
    'backoffice.packages.create': { paramsTuple?: []; params?: {} }
    'backoffice.packages.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'backoffice.admins.index': { paramsTuple?: []; params?: {} }
    'backoffice.admins.create': { paramsTuple?: []; params?: {} }
    'health_checks.live': { paramsTuple?: []; params?: {} }
    'health_checks.ready': { paramsTuple?: []; params?: {} }
  }
  POST: {
    'backoffice.auth.login.store': { paramsTuple?: []; params?: {} }
    'backoffice.auth.reset_password.store': { paramsTuple?: []; params?: {} }
    'backoffice.auth.new_password.store': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'backoffice.logout': { paramsTuple?: []; params?: {} }
    'backoffice.clients.store': { paramsTuple?: []; params?: {} }
    'backoffice.clients.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'backoffice.clients.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'backoffice.packages.store': { paramsTuple?: []; params?: {} }
    'backoffice.packages.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'backoffice.packages.advance_status': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'backoffice.packages.record_payment': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'backoffice.packages.upload_photo': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'backoffice.packages.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'backoffice.admins.store': { paramsTuple?: []; params?: {} }
    'backoffice.admins.toggle': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'backoffice.admins.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}