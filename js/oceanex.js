'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, AuthenticationError, ArgumentsRequired, BadRequest, InvalidOrder, InsufficientFunds, OrderNotFound, PermissionDenied } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class oceanex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'oceanex',
            'name': 'OceanEx',
            'countries': [ 'BS' ], // Bahamas
            'version': 'v1',
            'rateLimit': 3000,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/58385970-794e2d80-8001-11e9-889c-0567cd79b78e.jpg',
                'api': 'https://api.oceanex.pro',
                'www': 'https://www.oceanex.pro.com',
                'doc': 'https://api.oceanex.pro/doc/v1',
                'referral': 'https://oceanex.pro/signup?referral=VE24QX',
            },
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': undefined, // has but unimplemented
                'future': undefined,
                'option': undefined,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'cancelOrders': true,
                'createMarketOrder': true,
                'createOrder': true,
                'fetchBalance': true,
                'fetchBorrowRate': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchBorrowRates': false,
                'fetchBorrowRatesPerSymbol': false,
                'fetchClosedOrders': true,
                'fetchMarkets': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrderBooks': true,
                'fetchOrders': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': true,
                'fetchTradingLimits': undefined,
                'fetchTransactionFees': undefined,
            },
            'timeframes': {
                '1m': '1',
                '5m': '5',
                '15m': '15',
                '30m': '30',
                '1h': '60',
                '2h': '120',
                '4h': '240',
                '6h': '360',
                '12h': '720',
                '1d': '1440',
                '3d': '4320',
                '1w': '10080',
            },
            'api': {
                'public': {
                    'get': [
                        'markets',
                        'tickers/{pair}',
                        'tickers_multi',
                        'order_book',
                        'order_book/multi',
                        'fees/trading',
                        'trades',
                        'timestamp',
                    ],
                    'post': [
                        'k',
                    ],
                },
                'private': {
                    'get': [
                        'key',
                        'members/me',
                        'orders',
                        'orders/filter',
                    ],
                    'post': [
                        'orders',
                        'orders/multi',
                        'order/delete',
                        'order/delete/multi',
                        'orders/clear',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': this.parseNumber ('0.001'),
                    'taker': this.parseNumber ('0.001'),
                },
            },
            'commonCurrencies': {
                'PLA': 'Plair',
            },
            'exceptions': {
                'codes': {
                    '-1': BadRequest,
                    '-2': BadRequest,
                    '1001': BadRequest,
                    '1004': ArgumentsRequired,
                    '1006': AuthenticationError,
                    '1008': AuthenticationError,
                    '1010': AuthenticationError,
                    '1011': PermissionDenied,
                    '2001': AuthenticationError,
                    '2002': InvalidOrder,
                    '2004': OrderNotFound,
                    '9003': PermissionDenied,
                },
                'exact': {
                    'market does not have a valid value': BadRequest,
                    'side does not have a valid value': BadRequest,
                    'Account::AccountError: Cannot lock funds': InsufficientFunds,
                    'The account does not exist': AuthenticationError,
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        /**
         * @method
         * @name oceanex#fetchMarkets
         * @description retrieves data on all markets for oceanex
         * @param {dict} params extra parameters specific to the exchange api endpoint
         * @returns {[dict]} an array of objects representing market data
         */
        const request = { 'show_details': true };
        const response = await this.publicGetMarkets (this.extend (request, params));
        //
        //    {
        //        id: 'xtzusdt',
        //        name: 'XTZ/USDT',
        //        ask_precision: '8',
        //        bid_precision: '8',
        //        enabled: true,
        //        price_precision: '4',
        //        amount_precision: '3',
        //        usd_precision: '4',
        //        minimum_trading_amount: '1.0'
        //    },
        //
        const result = [];
        const markets = this.safeValue (response, 'data');
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeValue (market, 'id');
            const name = this.safeValue (market, 'name');
            let [ baseId, quoteId ] = name.split ('/');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            baseId = baseId.toLowerCase ();
            quoteId = quoteId.toLowerCase ();
            const symbol = base + '/' + quote;
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'settle': undefined,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': undefined,
                'type': 'spot',
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'active': undefined,
                'contract': false,
                'linear': undefined,
                'inverse': undefined,
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': this.safeInteger (market, 'amount_precision'),
                    'price': this.safeInteger (market, 'price_precision'),
                    'base': this.safeInteger (market, 'ask_precision'),
                    'quote': this.safeInteger (market, 'bid_precision'),
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'amount': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'cost': {
                        'min': this.safeNumber (market, 'minimum_trading_amount'),
                        'max': undefined,
                    },
                },
                'info': market,
            });
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        /**
         * @method
         * @name oceanex#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {str} symbol unified symbol of the market to fetch the ticker for
         * @param {dict} params extra parameters specific to the oceanex api endpoint
         * @returns {dict} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
        };
        const response = await this.publicGetTickersPair (this.extend (request, params));
        //
        //     {
        //         "code":0,
        //         "message":"Operation successful",
        //         "data": {
        //             "at":1559431729,
        //             "ticker": {
        //                 "buy":"0.0065",
        //                 "sell":"0.00677",
        //                 "low":"0.00677",
        //                 "high":"0.00677",
        //                 "last":"0.00677",
        //                 "vol":"2000.0"
        //             }
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        return this.parseTicker (data, market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        /**
         * @method
         * @name oceanex#fetchTickers
         * @description fetches price tickers for multiple markets, statistical calculations with the information calculated over the past 24 hours each market
         * @param {[str]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {dict} params extra parameters specific to the oceanex api endpoint
         * @returns {dict} an array of [ticker structures]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        if (symbols === undefined) {
            symbols = this.symbols;
        }
        const marketIds = this.marketIds (symbols);
        const request = { 'markets': marketIds };
        const response = await this.publicGetTickersMulti (this.extend (request, params));
        //
        //     {
        //         "code":0,
        //         "message":"Operation successful",
        //         "data": {
        //             "at":1559431729,
        //             "ticker": {
        //                 "buy":"0.0065",
        //                 "sell":"0.00677",
        //                 "low":"0.00677",
        //                 "high":"0.00677",
        //                 "last":"0.00677",
        //                 "vol":"2000.0"
        //             }
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data');
        const result = {};
        for (let i = 0; i < data.length; i++) {
            const ticker = data[i];
            const marketId = this.safeString (ticker, 'market');
            const market = this.safeMarket (marketId);
            const symbol = market['symbol'];
            result[symbol] = this.parseTicker (ticker, market);
        }
        return this.filterByArray (result, 'symbol', symbols);
    }

    parseTicker (data, market = undefined) {
        //
        //         {
        //             "at":1559431729,
        //             "ticker": {
        //                 "buy":"0.0065",
        //                 "sell":"0.00677",
        //                 "low":"0.00677",
        //                 "high":"0.00677",
        //                 "last":"0.00677",
        //                 "vol":"2000.0"
        //             }
        //         }
        //
        const ticker = this.safeValue (data, 'ticker', {});
        const timestamp = this.safeTimestamp (data, 'at');
        const symbol = this.safeSymbol (undefined, market);
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'high'),
            'low': this.safeString (ticker, 'low'),
            'bid': this.safeString (ticker, 'buy'),
            'bidVolume': undefined,
            'ask': this.safeString (ticker, 'sell'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': this.safeString (ticker, 'last'),
            'last': this.safeString (ticker, 'last'),
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeString (ticker, 'volume'),
            'quoteVolume': undefined,
            'info': ticker,
        }, market, false);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name oceanex#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {str} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {dict} params extra parameters specific to the oceanex api endpoint
         * @returns {dict} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetOrderBook (this.extend (request, params));
        //
        //     {
        //         "code":0,
        //         "message":"Operation successful",
        //         "data": {
        //             "timestamp":1559433057,
        //             "asks": [
        //                 ["100.0","20.0"],
        //                 ["4.74","2000.0"],
        //                 ["1.74","4000.0"],
        //             ],
        //             "bids":[
        //                 ["0.0065","5482873.4"],
        //                 ["0.00649","4781956.2"],
        //                 ["0.00648","2876006.8"],
        //             ],
        //         }
        //     }
        //
        const orderbook = this.safeValue (response, 'data', {});
        const timestamp = this.safeTimestamp (orderbook, 'timestamp');
        return this.parseOrderBook (orderbook, symbol, timestamp);
    }

    async fetchOrderBooks (symbols = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        if (symbols === undefined) {
            symbols = this.symbols;
        }
        const marketIds = this.marketIds (symbols);
        const request = {
            'markets': marketIds,
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetOrderBookMulti (this.extend (request, params));
        //
        //     {
        //         "code":0,
        //         "message":"Operation successful",
        //         "data": [
        //             {
        //                 "timestamp":1559433057,
        //                 "market": "bagvet",
        //                 "asks": [
        //                     ["100.0","20.0"],
        //                     ["4.74","2000.0"],
        //                     ["1.74","4000.0"],
        //                 ],
        //                 "bids":[
        //                     ["0.0065","5482873.4"],
        //                     ["0.00649","4781956.2"],
        //                     ["0.00648","2876006.8"],
        //                 ],
        //             },
        //             ...,
        //         ],
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        const result = {};
        for (let i = 0; i < data.length; i++) {
            const orderbook = data[i];
            const marketId = this.safeString (orderbook, 'market');
            const symbol = this.safeSymbol (marketId);
            const timestamp = this.safeTimestamp (orderbook, 'timestamp');
            result[symbol] = this.parseOrderBook (orderbook, symbol, timestamp);
        }
        return result;
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name oceanex#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {str} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {dict} params extra parameters specific to the oceanex api endpoint
         * @returns {[dict]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetTrades (this.extend (request, params));
        //
        //      {
        //          "code":0,
        //          "message":"Operation successful",
        //          "data": [
        //              {
        //                  "id":220247666,
        //                  "price":"3098.62",
        //                  "volume":"0.00196",
        //                  "funds":"6.0732952",
        //                  "market":"ethusdt",
        //                  "created_at":"2022-04-19T19:03:15Z",
        //                  "created_on":1650394995,
        //                  "side":"bid"
        //              },
        //          ]
        //      }
        //
        const data = this.safeValue (response, 'data');
        return this.parseTrades (data, market, since, limit);
    }

    parseTrade (trade, market = undefined) {
        //
        // fetchTrades (public)
        //
        //      {
        //          "id":220247666,
        //          "price":"3098.62",
        //          "volume":"0.00196",
        //          "funds":"6.0732952",
        //          "market":"ethusdt",
        //          "created_at":"2022-04-19T19:03:15Z",
        //          "created_on":1650394995,
        //          "side":"bid"
        //      }
        //
        let side = this.safeValue (trade, 'side');
        if (side === 'bid') {
            side = 'buy';
        } else if (side === 'ask') {
            side = 'sell';
        }
        const marketId = this.safeValue (trade, 'market');
        const symbol = this.safeSymbol (marketId, market);
        let timestamp = this.safeTimestamp (trade, 'created_on');
        if (timestamp === undefined) {
            timestamp = this.parse8601 (this.safeString (trade, 'created_at'));
        }
        const priceString = this.safeString (trade, 'price');
        const amountString = this.safeString (trade, 'volume');
        return this.safeTrade ({
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': this.safeString (trade, 'id'),
            'order': undefined,
            'type': 'limit',
            'takerOrMaker': undefined,
            'side': side,
            'price': priceString,
            'amount': amountString,
            'cost': undefined,
            'fee': undefined,
        }, market);
    }

    async fetchTime (params = {}) {
        const response = await this.publicGetTimestamp (params);
        //
        //     {"code":0,"message":"Operation successful","data":1559433420}
        //
        return this.safeTimestamp (response, 'data');
    }

    async fetchTradingFees (params = {}) {
        const response = await this.publicGetFeesTrading (params);
        const data = this.safeValue (response, 'data');
        const result = {};
        for (let i = 0; i < data.length; i++) {
            const group = data[i];
            const maker = this.safeValue (group, 'ask_fee', {});
            const taker = this.safeValue (group, 'bid_fee', {});
            const marketId = this.safeString (group, 'market');
            const symbol = this.safeSymbol (marketId);
            result[symbol] = {
                'info': group,
                'symbol': symbol,
                'maker': this.safeNumber (maker, 'value'),
                'taker': this.safeNumber (taker, 'value'),
                'percentage': true,
            };
        }
        return result;
    }

    async fetchKey (params = {}) {
        const response = await this.privateGetKey (params);
        return this.safeValue (response, 'data');
    }

    parseBalance (response) {
        const data = this.safeValue (response, 'data');
        const balances = this.safeValue (data, 'accounts');
        const result = { 'info': response };
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const currencyId = this.safeValue (balance, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeString (balance, 'balance');
            account['used'] = this.safeString (balance, 'locked');
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    async fetchBalance (params = {}) {
        /**
         * @method
         * @name oceanex#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {dict} params extra parameters specific to the oceanex api endpoint
         * @returns {dict} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.loadMarkets ();
        const response = await this.privateGetMembersMe (params);
        return this.parseBalance (response);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
            'side': side,
            'ord_type': type,
            'volume': this.amountToPrecision (symbol, amount),
        };
        if (type === 'limit') {
            request['price'] = this.priceToPrecision (symbol, price);
        }
        const response = await this.privatePostOrders (this.extend (request, params));
        const data = this.safeValue (response, 'data');
        return this.parseOrder (data, market);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        let ids = id;
        if (!Array.isArray (id)) {
            ids = [ id ];
        }
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const request = { 'ids': ids };
        const response = await this.privateGetOrders (this.extend (request, params));
        const data = this.safeValue (response, 'data');
        const dataLength = data.length;
        if (data === undefined) {
            throw new OrderNotFound (this.id + ' could not found matching order');
        }
        if (Array.isArray (id)) {
            return this.parseOrders (data, market);
        }
        if (dataLength === 0) {
            throw new OrderNotFound (this.id + ' could not found matching order');
        }
        return this.parseOrder (data[0], market);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            'states': [ 'wait' ],
        };
        return await this.fetchOrders (symbol, since, limit, this.extend (request, params));
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            'states': [ 'done', 'cancel' ],
        };
        return await this.fetchOrders (symbol, since, limit, this.extend (request, params));
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrders() requires a `symbol` argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const states = this.safeValue (params, 'states', [ 'wait', 'done', 'cancel' ]);
        const query = this.omit (params, 'states');
        const request = {
            'market': market['id'],
            'states': states,
            'need_price': 'True',
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetOrdersFilter (this.extend (request, query));
        const data = this.safeValue (response, 'data', []);
        let result = [];
        for (let i = 0; i < data.length; i++) {
            const orders = this.safeValue (data[i], 'orders', []);
            const status = this.parseOrderStatus (this.safeValue (data[i], 'state'));
            const parsedOrders = this.parseOrders (orders, market, since, limit, { 'status': status });
            result = this.arrayConcat (result, parsedOrders);
        }
        return result;
    }

    parseOHLCV (ohlcv, market = undefined) {
        // [
        //    1559232000,
        //    8889.22,
        //    9028.52,
        //    8889.22,
        //    9028.52
        //    0.3121
        // ]
        return [
            this.safeTimestamp (ohlcv, 0),
            this.safeNumber (ohlcv, 1),
            this.safeNumber (ohlcv, 2),
            this.safeNumber (ohlcv, 3),
            this.safeNumber (ohlcv, 4),
            this.safeNumber (ohlcv, 5),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name oceanex#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {str} symbol unified symbol of the market to fetch OHLCV data for
         * @param {str} timeframe the length of time each candle represents
         * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
         * @param {int|undefined} limit the maximum amount of candles to fetch
         * @param {dict} params extra parameters specific to the oceanex api endpoint
         * @returns {[[int]]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
            'period': this.timeframes[timeframe],
        };
        if (since !== undefined) {
            request['timestamp'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicPostK (this.extend (request, params));
        const ohlcvs = this.safeValue (response, 'data', []);
        return this.parseOHLCVs (ohlcvs, market, timeframe, since, limit);
    }

    parseOrder (order, market = undefined) {
        //
        //     {
        //         "created_at": "2019-01-18T00:38:18Z",
        //         "trades_count": 0,
        //         "remaining_volume": "0.2",
        //         "price": "1001.0",
        //         "created_on": "1547771898",
        //         "side": "buy",
        //         "volume": "0.2",
        //         "state": "wait",
        //         "ord_type": "limit",
        //         "avg_price": "0.0",
        //         "executed_volume": "0.0",
        //         "id": 473797,
        //         "market": "veteth"
        //     }
        //
        const status = this.parseOrderStatus (this.safeValue (order, 'state'));
        const marketId = this.safeString2 (order, 'market', 'market_id');
        const symbol = this.safeSymbol (marketId, market);
        let timestamp = this.safeTimestamp (order, 'created_on');
        if (timestamp === undefined) {
            timestamp = this.parse8601 (this.safeString (order, 'created_at'));
        }
        const price = this.safeString (order, 'price');
        const average = this.safeString (order, 'avg_price');
        const amount = this.safeString (order, 'volume');
        const remaining = this.safeString (order, 'remaining_volume');
        const filled = this.safeString (order, 'executed_volume');
        return this.safeOrder ({
            'info': order,
            'id': this.safeString (order, 'id'),
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': this.safeValue (order, 'ord_type'),
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': this.safeValue (order, 'side'),
            'price': price,
            'stopPrice': undefined,
            'average': average,
            'amount': amount,
            'remaining': remaining,
            'filled': filled,
            'status': status,
            'cost': undefined,
            'trades': undefined,
            'fee': undefined,
        }, market);
    }

    parseOrderStatus (status) {
        const statuses = {
            'wait': 'open',
            'done': 'closed',
            'cancel': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    async createOrders (symbol, orders, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
            'orders': orders,
        };
        // orders: [{"side":"buy", "volume":.2, "price":1001}, {"side":"sell", "volume":0.2, "price":1002}]
        const response = await this.privatePostOrdersMulti (this.extend (request, params));
        const data = response['data'];
        return this.parseOrders (data);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.privatePostOrderDelete (this.extend ({ 'id': id }, params));
        const data = this.safeValue (response, 'data');
        return this.parseOrder (data);
    }

    async cancelOrders (ids, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.privatePostOrderDeleteMulti (this.extend ({ 'ids': ids }, params));
        const data = this.safeValue (response, 'data');
        return this.parseOrders (data);
    }

    async cancelAllOrders (symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.privatePostOrdersClear (params);
        const data = this.safeValue (response, 'data');
        return this.parseOrders (data);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.version + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (path === 'tickers_multi' || path === 'order_book/multi') {
                let request = '?';
                const markets = this.safeValue (params, 'markets');
                for (let i = 0; i < markets.length; i++) {
                    request += 'markets[]=' + markets[i] + '&';
                }
                const limit = this.safeValue (params, 'limit');
                if (limit !== undefined) {
                    request += 'limit=' + limit;
                }
                url += request;
            } else if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else if (api === 'private') {
            this.checkRequiredCredentials ();
            const request = {
                'uid': this.apiKey,
                'data': query,
            };
            // to set the private key:
            // const fs = require ('fs')
            // exchange.secret = fs.readFileSync ('oceanex.pem', 'utf8')
            const jwt_token = this.jwt (request, this.encode (this.secret), 'RS256');
            url += '?user_jwt=' + jwt_token;
        }
        headers = { 'Content-Type': 'application/json' };
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        //
        //     {"code":1011,"message":"This IP 'x.x.x.x' is not allowed","data":{}}
        //
        if (response === undefined) {
            return;
        }
        const errorCode = this.safeString (response, 'code');
        const message = this.safeString (response, 'message');
        if ((errorCode !== undefined) && (errorCode !== '0')) {
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions['codes'], errorCode, feedback);
            this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
            throw new ExchangeError (feedback);
        }
    }
};
