/*jslint node: true*/
'use strict';

var { JSDOM } = require('jsdom');
var { window } = new JSDOM();
var { document } = window;

global.window = window;
global.document = document;
window.$ = window.jQuery = require('jquery');

require('signalr');

var SignalR = module.exports = {

    HubConnectionBuilder: function () {

        return this;
    },
    withUrl: function (url, options) {

        this.url = url;
        this.options = options;
        return this;
    },
    withAutomaticReconnect: function (policy) {

        this.policy = policy;
        return this;
    },
    withHub: function (hub, methods) {

        this.hub = hub;
        this.methods = methods;
        return this;
    },
    withHubProtocol: function () {

        throw new Error('Setting protocol not supported in version 2');
    },
    build: function () {

        var self = this;
        if (!self.url) throw new Error('withUrl not called or invalid url');
        var getEventFunc = function (wräpper, event) {

            return function (callback) {

                if (!wräpper.connection) {

                    throw new Error('start not called or failed');
                }
                if (typeof wräpper.connection[event] !== 'function') {

                    throw new Error('wrong event name');
                }
                wräpper.connection[event](callback);
            };
        };
        let wrapper;
        return wrapper = {

            start: function () {

                if (typeof window.$ !== 'function') {

                    throw new Error('jsdom jQueryify failed');
                }
                if (typeof window.$.hubConnection !== 'function') {

                    throw new Error('SignalR script failed');
                }
                let { accessTokenFactory: access } = self.options || {};
                let qs;
                if (typeof access === 'function') {

                    qs = { AccessToken: access() };
                }
                wrapper.connection = window.$.hubConnection(self.url, qs ? { qs } : undefined);
                wrapper.proxy = wrapper.connection.createHubProxy(self.hub || self.url.split('/').pop());
                if (Array.isArray(self.methods)) {

                    self.methods.forEach(function (method) {

                        wrapper.proxy.on(method, function () { });
                    });
                }
                let { nextRetryDelayInMilliseconds: retry } = self.policy || {};
                if (typeof retry === 'function') {

                    wrapper.connection.reconnectDelay = retry();
                }
                return new Promise((resolve, reject) => {

                    wrapper.connection.start({ transport: 'auto', waitForPageLoad: false }).done(resolve).fail(reject);
                });
            },
            stop: function () {

                if (!wrapper.connection) {

                    throw new Error('start not called or failed');
                }
                return new Promise((resolve, reject) => {

                    let disconnected;
                    setTimeout(function () {

                        if (disconnected === undefined) {

                            reject(disconnected = false);
                        }
                    }, 3000);
                    wrapper.connection.disconnected(function () {

                        if (disconnected === undefined) {

                            resolve(disconnected = true);
                        }
                    });
                    wrapper.connection.stop();
                });
            },
            off: function (method, handler) {

                if (!wrapper.proxy) {

                    throw new Error('start not called or failed');
                }
                wrapper.proxy.off(method, handler);
            },
            on: function (method, handler) {

                if (!wrapper.proxy) {

                    throw new Error('start not called or failed');
                }
                wrapper.proxy.on(method, handler);
            },
            starting: getEventFunc(wrapper, 'starting'),
            received: getEventFunc(wrapper, 'received'),
            stateChanged: getEventFunc(wrapper, 'stateChanged'),
            disconnected: getEventFunc(wrapper, 'disconnected'),
            connectionSlow: getEventFunc(wrapper, 'connectionSlow'),
            reconnecting: getEventFunc(wrapper, 'reconnecting'),
            reconnected: getEventFunc(wrapper, 'reconnected'),
            send: function (message, args) {

                if (!wrapper.connection) {

                    throw new Error('start not called or failed');
                }
                if (!args) return new Promise((resolve, reject) => {

                    let sent;
                    setTimeout(function () {

                        if (sent === undefined) {

                            resolve(sent = true);
                        }
                    }, 3000);
                    wrapper.connection.error(function () {

                        if (sent === undefined) {

                            reject(sent = false);
                        }
                    });
                    wrapper.connection.send(message);
                }); else return wrapper.invoke(message, arg);
            },
            invoke: function (method, args) {

                if (!wrapper.proxy) {

                    throw new Error('start not called or failed');
                }
                return new Promise((resolve, reject) => {

                    if (args && !Array.isArray(args)) args = [args];
                    wrapper.proxy.invoke(method, ...(args ? args : [])).done(resolve).fail(reject);
                });
            },
            stream: function () {

                throw new Error('stream not supported in version 2');
            }
        };
    }
};

SignalR.HubConnectionBuilder.prototype = SignalR;
