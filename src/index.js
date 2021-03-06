(function () {
  var global = typeof window !== 'undefined' ? window : this || Function('return this')();
  var nx = global.nx || require('@jswork/next');
  var EventMitt = global.EventMitt || require('@jswork/event-mitt');
  var nxDeepEach = nx.deepEach || require('@jswork/next-deep-each');
  var nxDeepClone = nx.deepClone || require('@jswork/next-deep-clone');

  // https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy

  var NxActiveState = nx.declare('nx.ActiveState', {
    methods: {
      __initialized__: false,
      init: function (inData) {
        nx.mix(this, EventMitt);
        var handler = (key, args) => {
          this.__initialized__ && this.emit('change', { action: key, args: args });
          return Reflect[key].apply(null, args);
        };

        var proxyer = {
          set: function () {
            var args = nx.slice(arguments);
            var value = args[2];
            if (value && typeof value === 'object') {
              args[2] = new Proxy(value, proxyer);
            }
            return handler('set', args);
          },
          deleteProperty: function () {
            return handler('deleteProperty', nx.slice(arguments));
          }
        };

        this.state = new Proxy(inData, proxyer);
        nxDeepEach(this.state, (key, value, target) => (target[key] = value));
        this.__initialized__ = true;
      },
      to: function () {
        return nxDeepClone(this.state);
      }
    }
  });

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = NxActiveState;
  }
})();
