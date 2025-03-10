'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ExchangeNotAvailable, RequestTimeout, AuthenticationError, PermissionDenied, RateLimitExceeded, InsufficientFunds, OrderNotFound, InvalidOrder, AccountSuspended, CancelPending, InvalidNonce, OnMaintenance, BadSymbol } = require ('./base/errors');
const Precise = require ('./base/Precise');

//  ---------------------------------------------------------------------------

module.exports = class poloniex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'poloniex',
            'name': 'Poloniex',
            'countries': [ 'US' ],
            'rateLimit': 166.667, // 6 calls per second,  1000ms / 6 = 166.667ms between requests
            'certified': false,
            'pro': true,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': undefined, // has but not fully implemented
                'swap': undefined, // has but not fully implemented
                'future': undefined, // has but not fully implemented
                'option': undefined,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'createDepositAddress': true,
                'createMarketOrder': undefined,
                'createOrder': true,
                'editOrder': true,
                'fetchBalance': true,
                'fetchClosedOrder': 'emulated',
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchDeposits': true,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrder': true, // true endpoint for a single open order
                'fetchOpenOrders': true, // true endpoint for open orders
                'fetchOrderBook': true,
                'fetchOrderBooks': true,
                'fetchOrderTrades': true, // true endpoint for trades of a single open or closed order
                'fetchPosition': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': true,
                'fetchTransactions': true,
                'fetchTransfer': false,
                'fetchTransfers': false,
                'fetchWithdrawals': true,
                'transfer': true,
                'withdraw': true,
            },
            'timeframes': {
                '5m': 300,
                '15m': 900,
                '30m': 1800,
                '2h': 7200,
                '4h': 14400,
                '1d': 86400,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766817-e9456312-5ee6-11e7-9b3c-b628ca5626a5.jpg',
                'api': {
                    'public': 'https://poloniex.com/public',
                    'private': 'https://poloniex.com/tradingApi',
                },
                'www': 'https://www.poloniex.com',
                'doc': 'https://docs.poloniex.com',
                'fees': 'https://poloniex.com/fees',
                'referral': 'https://poloniex.com/signup?c=UBFZJRPJ',
            },
            'api': {
                'public': {
                    'get': {
                        'return24hVolume': 1,
                        'returnChartData': 1,
                        'returnCurrencies': 1,
                        'returnLoanOrders': 1,
                        'returnOrderBook': 1,
                        'returnTicker': 1,
                        'returnTradeHistory': 1,
                    },
                },
                'private': {
                    'post': {
                        'buy': 1,
                        'cancelLoanOffer': 1,
                        'cancelOrder': 1,
                        'cancelAllOrders': 1,
                        'closeMarginPosition': 1,
                        'createLoanOffer': 1,
                        'generateNewAddress': 1,
                        'getMarginPosition': 1,
                        'marginBuy': 1,
                        'marginSell': 1,
                        'moveOrder': 1,
                        'returnActiveLoans': 1,
                        'returnAvailableAccountBalances': 1,
                        'returnBalances': 1,
                        'returnCompleteBalances': 1,
                        'returnDepositAddresses': 1,
                        'returnDepositsWithdrawals': 1,
                        'returnFeeInfo': 1,
                        'returnLendingHistory': 1,
                        'returnMarginAccountSummary': 1,
                        'returnOpenLoanOffers': 1,
                        'returnOpenOrders': 1,
                        'returnOrderTrades': 1,
                        'returnOrderStatus': 1,
                        'returnTradableBalances': 1,
                        'returnTradeHistory': 1,
                        'sell': 1,
                        'toggleAutoRenew': 1,
                        'transferBalance': 1,
                        'withdraw': 1,
                    },
                },
            },
            'fees': {
                'trading': {
                    'feeSide': 'get',
                    // starting from Jan 8 2020
                    'maker': this.parseNumber ('0.0009'),
                    'taker': this.parseNumber ('0.0009'),
                },
                'funding': {},
            },
            'limits': {
                'amount': {
                    'min': 0.000001,
                    'max': undefined,
                },
                'price': {
                    'min': 0.00000001,
                    'max': 1000000000,
                },
                'cost': {
                    'min': 0.00000000,
                    'max': 1000000000,
                },
            },
            'precision': {
                'amount': 8,
                'price': 8,
            },
            'commonCurrencies': {
                'AIR': 'AirCoin',
                'APH': 'AphroditeCoin',
                'BCC': 'BTCtalkcoin',
                'BCHABC': 'BCHABC',
                'BDG': 'Badgercoin',
                'BTM': 'Bitmark',
                'CON': 'Coino',
                'GOLD': 'GoldEagles',
                'GPUC': 'GPU',
                'HOT': 'Hotcoin',
                'ITC': 'Information Coin',
                'KEY': 'KEYCoin',
                'MASK': 'NFTX Hashmasks Index', // conflict with Mask Network
                'MEME': 'Degenerator Meme', // Degenerator Meme migrated to Meme Inu, this exchange still has the old price
                'PLX': 'ParallaxCoin',
                'REPV2': 'REP',
                'STR': 'XLM',
                'SOC': 'SOCC',
                'TRADE': 'Unitrade',
                'XAP': 'API Coin',
                // this is not documented in the API docs for Poloniex
                // https://github.com/ccxt/ccxt/issues/7084
                // when the user calls withdraw ('USDT', amount, address, tag, params)
                // with params = { 'currencyToWithdrawAs': 'USDTTRON' }
                // or params = { 'currencyToWithdrawAs': 'USDTETH' }
                // fetchWithdrawals ('USDT') returns the corresponding withdrawals
                // with a USDTTRON or a USDTETH currency id, respectfully
                // therefore we have map them back to the original code USDT
                // otherwise the returned withdrawals are filtered out
                'USDTTRON': 'USDT',
                'USDTETH': 'USDT',
            },
            'options': {
                'networks': {
                    'ERC20': 'ETH',
                    'TRX': 'TRON',
                    'TRC20': 'TRON',
                },
                'limits': {
                    'cost': {
                        'min': {
                            'BTC': 0.0001,
                            'ETH': 0.0001,
                            'USDT': 1.0,
                            'TRX': 100,
                            'BNB': 0.06,
                            'USDC': 1.0,
                            'USDJ': 1.0,
                            'TUSD': 0.0001,
                            'DAI': 1.0,
                            'PAX': 1.0,
                            'BUSD': 1.0,
                        },
                    },
                },
                'accountsByType': {
                    'spot': 'exchange',
                    'margin': 'margin',
                    'future': 'futures',
                    'lending': 'lending',
                },
                'accountsById': {
                    'exchange': 'spot',
                    'margin': 'margin',
                    'futures': 'future',
                    'lending': 'lending',
                },
            },
            'exceptions': {
                'exact': {
                    'You may only place orders that reduce your position.': InvalidOrder,
                    'Invalid order number, or you are not the person who placed the order.': OrderNotFound,
                    'Permission denied': PermissionDenied,
                    'Permission denied.': PermissionDenied,
                    'Connection timed out. Please try again.': RequestTimeout,
                    'Internal error. Please try again.': ExchangeNotAvailable,
                    'Currently in maintenance mode.': OnMaintenance,
                    'Order not found, or you are not the person who placed it.': OrderNotFound,
                    'Invalid API key/secret pair.': AuthenticationError,
                    'Please do not make more than 8 API calls per second.': RateLimitExceeded,
                    'This IP has been temporarily throttled. Please ensure your requests are valid and try again in one minute.': RateLimitExceeded,
                    'Rate must be greater than zero.': InvalidOrder, // {"error":"Rate must be greater than zero."}
                    'Invalid currency pair.': BadSymbol, // {"error":"Invalid currency pair."}
                    'Invalid currencyPair parameter.': BadSymbol, // {"error":"Invalid currencyPair parameter."}
                    'Trading is disabled in this market.': BadSymbol, // {"error":"Trading is disabled in this market."}
                    'Invalid orderNumber parameter.': OrderNotFound,
                    'Order is beyond acceptable bounds.': InvalidOrder, // {"error":"Order is beyond acceptable bounds.","fee":"0.00155000","currencyPair":"USDT_BOBA"}
                    'This account is closed.': AccountSuspended, // {"error":"This account is closed."}
                },
                'broad': {
                    'Total must be at least': InvalidOrder, // {"error":"Total must be at least 0.0001."}
                    'This account is frozen': AccountSuspended, // {"error":"This account is frozen for trading."} || {"error":"This account is frozen."}
                    'This account is locked.': AccountSuspended, // {"error":"This account is locked."}
                    'Not enough': InsufficientFunds,
                    'Nonce must be greater': InvalidNonce,
                    'You have already called cancelOrder': CancelPending, // {"error":"You have already called cancelOrder, moveOrder, or cancelReplace on this order. Please wait for that call's response."}
                    'Amount must be at least': InvalidOrder, // {"error":"Amount must be at least 0.000001."}
                    'is either completed or does not exist': OrderNotFound, // {"error":"Order 587957810791 is either completed or does not exist."}
                    'Error pulling ': ExchangeError, // {"error":"Error pulling order book"}
                },
            },
        });
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        //     {
        //         "date":1590913773,
        //         "high":0.02491611,
        //         "low":0.02491611,
        //         "open":0.02491611,
        //         "close":0.02491611,
        //         "volume":0,
        //         "quoteVolume":0,
        //         "weightedAverage":0.02491611
        //     }
        //
        return [
            this.safeTimestamp (ohlcv, 'date'),
            this.safeNumber (ohlcv, 'open'),
            this.safeNumber (ohlcv, 'high'),
            this.safeNumber (ohlcv, 'low'),
            this.safeNumber (ohlcv, 'close'),
            this.safeNumber (ohlcv, 'quoteVolume'),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '5m', since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name poloniex#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {str} symbol unified symbol of the market to fetch OHLCV data for
         * @param {str} timeframe the length of time each candle represents
         * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
         * @param {int|undefined} limit the maximum amount of candles to fetch
         * @param {dict} params extra parameters specific to the poloniex api endpoint
         * @returns {[[int]]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'currencyPair': market['id'],
            'period': this.timeframes[timeframe],
        };
        if (since === undefined) {
            request['end'] = this.seconds ();
            if (limit === undefined) {
                request['start'] = request['end'] - this.parseTimeframe ('1w'); // max range = 1 week
            } else {
                request['start'] = request['end'] - limit * this.parseTimeframe (timeframe);
            }
        } else {
            request['start'] = parseInt (since / 1000);
            if (limit !== undefined) {
                const end = this.sum (request['start'], limit * this.parseTimeframe (timeframe));
                request['end'] = end;
            }
        }
        const response = await this.publicGetReturnChartData (this.extend (request, params));
        //
        //     [
        //         {"date":1590913773,"high":0.02491611,"low":0.02491611,"open":0.02491611,"close":0.02491611,"volume":0,"quoteVolume":0,"weightedAverage":0.02491611},
        //         {"date":1590913800,"high":0.02495324,"low":0.02489501,"open":0.02491797,"close":0.02493693,"volume":0.0927415,"quoteVolume":3.7227869,"weightedAverage":0.02491185},
        //         {"date":1590914100,"high":0.02498596,"low":0.02488503,"open":0.02493033,"close":0.02497896,"volume":0.21196348,"quoteVolume":8.50291888,"weightedAverage":0.02492832},
        //     ]
        //
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    async loadMarkets (reload = false, params = {}) {
        const markets = await super.loadMarkets (reload, params);
        const currenciesByNumericId = this.safeValue (this.options, 'currenciesByNumericId');
        if ((currenciesByNumericId === undefined) || reload) {
            this.options['currenciesByNumericId'] = this.indexBy (this.currencies, 'numericId');
        }
        return markets;
    }

    async fetchMarkets (params = {}) {
        /**
         * @method
         * @name poloniex#fetchMarkets
         * @description retrieves data on all markets for poloniex
         * @param {dict} params extra parameters specific to the exchange api endpoint
         * @returns {[dict]} an array of objects representing market data
         */
        const markets = await this.publicGetReturnTicker (params);
        const keys = Object.keys (markets);
        const result = [];
        for (let i = 0; i < keys.length; i++) {
            const id = keys[i];
            const market = markets[id];
            const [ quoteId, baseId ] = id.split ('_');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const isFrozen = this.safeString (market, 'isFrozen');
            const marginEnabled = this.safeInteger (market, 'marginTradingEnabled');
            // these are known defaults
            result.push ({
                'id': id,
                'numericId': this.safeInteger (market, 'id'),
                'symbol': base + '/' + quote,
                'base': base,
                'quote': quote,
                'settle': undefined,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': undefined,
                'type': 'spot',
                'spot': true,
                'margin': (marginEnabled === 1),
                'swap': false,
                'future': false,
                'option': false,
                'active': (isFrozen !== '1'),
                'contract': false,
                'linear': undefined,
                'inverse': undefined,
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': parseInt ('8'),
                    'price': parseInt ('8'),
                },
                'limits': this.extend (this.limits, {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'cost': {
                        'min': this.safeValue (this.options['limits']['cost']['min'], quote),
                        'max': undefined,
                    },
                }),
                'info': market,
            });
        }
        return result;
    }

    parseBalance (response) {
        const result = {
            'info': response,
            'timestamp': undefined,
            'datetime': undefined,
        };
        const currencyIds = Object.keys (response);
        for (let i = 0; i < currencyIds.length; i++) {
            const currencyId = currencyIds[i];
            const balance = this.safeValue (response, currencyId, {});
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeString (balance, 'available');
            account['used'] = this.safeString (balance, 'onOrders');
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    async fetchBalance (params = {}) {
        /**
         * @method
         * @name poloniex#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {dict} params extra parameters specific to the poloniex api endpoint
         * @returns {dict} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.loadMarkets ();
        const request = {
            'account': 'all',
        };
        const response = await this.privatePostReturnCompleteBalances (this.extend (request, params));
        //
        //     {
        //         "1CR":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},
        //         "ABY":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},
        //         "AC":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},
        //     }
        //
        return this.parseBalance (response);
    }

    async fetchTradingFees (params = {}) {
        await this.loadMarkets ();
        const response = await this.privatePostReturnFeeInfo (params);
        //
        //     {
        //         makerFee: '0.00100000',
        //         takerFee: '0.00200000',
        //         marginMakerFee: '0.00100000',
        //         marginTakerFee: '0.00200000',
        //         thirtyDayVolume: '106.08463302',
        //         nextTier: 500000,
        //     }
        //
        const result = {};
        for (let i = 0; i < this.symbols.length; i++) {
            const symbol = this.symbols[i];
            result[symbol] = {
                'info': response,
                'symbol': symbol,
                'maker': this.safeNumber (response, 'makerFee'),
                'taker': this.safeNumber (response, 'takerFee'),
                'percentage': true,
                'tierBased': true,
            };
        }
        return result;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name poloniex#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {str} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {dict} params extra parameters specific to the poloniex api endpoint
         * @returns {dict} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const request = {
            'currencyPair': this.marketId (symbol),
        };
        if (limit !== undefined) {
            request['depth'] = limit; // 100
        }
        const response = await this.publicGetReturnOrderBook (this.extend (request, params));
        const orderbook = this.parseOrderBook (response, symbol);
        orderbook['nonce'] = this.safeInteger (response, 'seq');
        return orderbook;
    }

    async fetchOrderBooks (symbols = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'currencyPair': 'all',
        };
        if (limit !== undefined) {
            request['depth'] = limit; // 100
        }
        const response = await this.publicGetReturnOrderBook (this.extend (request, params));
        const marketIds = Object.keys (response);
        const result = {};
        for (let i = 0; i < marketIds.length; i++) {
            const marketId = marketIds[i];
            let symbol = undefined;
            if (marketId in this.markets_by_id) {
                symbol = this.markets_by_id[marketId]['symbol'];
            } else {
                const [ quoteId, baseId ] = marketId.split ('_');
                const base = this.safeCurrencyCode (baseId);
                const quote = this.safeCurrencyCode (quoteId);
                symbol = base + '/' + quote;
            }
            const orderbook = this.parseOrderBook (response[marketId], symbol);
            orderbook['nonce'] = this.safeInteger (response[marketId], 'seq');
            result[symbol] = orderbook;
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        // {
        //     id: '121',
        //     last: '43196.31469670',
        //     lowestAsk: '43209.61843169',
        //     highestBid: '43162.41965234',
        //     percentChange: '0.00963340',
        //     baseVolume: '13444643.33799658',
        //     quoteVolume: '315.84780115',
        //     isFrozen: '0',
        //     postOnly: '0',
        //     marginTradingEnabled: '1',
        //     high24hr: '43451.84481934',
        //     low24hr: '41749.89529736'
        // }
        const timestamp = this.milliseconds ();
        const symbol = this.safeSymbol (undefined, market);
        const last = this.safeString (ticker, 'last');
        const relativeChange = this.safeString (ticker, 'percentChange');
        const percentage = Precise.stringMul (relativeChange, '100');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'high24hr'),
            'low': this.safeString (ticker, 'low24hr'),
            'bid': this.safeString (ticker, 'highestBid'),
            'bidVolume': undefined,
            'ask': this.safeString (ticker, 'lowestAsk'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': percentage,
            'average': undefined,
            'baseVolume': this.safeString (ticker, 'quoteVolume'),
            'quoteVolume': this.safeString (ticker, 'baseVolume'),
            'info': ticker,
        }, market, false);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        /**
         * @method
         * @name poloniex#fetchTickers
         * @description fetches price tickers for multiple markets, statistical calculations with the information calculated over the past 24 hours each market
         * @param {[str]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {dict} params extra parameters specific to the poloniex api endpoint
         * @returns {dict} an array of [ticker structures]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        const response = await this.publicGetReturnTicker (params);
        const ids = Object.keys (response);
        const result = {};
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            let symbol = undefined;
            let market = undefined;
            if (id in this.markets_by_id) {
                market = this.markets_by_id[id];
                symbol = market['symbol'];
            } else {
                const [ quoteId, baseId ] = id.split ('_');
                const base = this.safeCurrencyCode (baseId);
                const quote = this.safeCurrencyCode (quoteId);
                symbol = base + '/' + quote;
                market = { 'symbol': symbol };
            }
            const ticker = response[id];
            result[symbol] = this.parseTicker (ticker, market);
        }
        return this.filterByArray (result, 'symbol', symbols);
    }

    async fetchCurrencies (params = {}) {
        const response = await this.publicGetReturnCurrencies (params);
        //
        //     {
        //       "id": "293",
        //       "name": "0x",
        //       "humanType": "Sweep to Main Account",
        //       "currencyType": "address",
        //       "txFee": "17.21877546",
        //       "minConf": "12",
        //       "depositAddress": null,
        //       "disabled": "0",
        //       "frozen": "0",
        //       "hexColor": "003831",
        //       "blockchain": "ETH",
        //       "delisted": "0",
        //       "isGeofenced": 0
        //     }
        //
        const ids = Object.keys (response);
        const result = {};
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const currency = response[id];
            const precision = 8; // default precision, todo: fix "magic constants"
            const amountLimit = '1e-8';
            const code = this.safeCurrencyCode (id);
            const delisted = this.safeInteger (currency, 'delisted', 0);
            const disabled = this.safeInteger (currency, 'disabled', 0);
            const listed = !delisted;
            const enabled = !disabled;
            const active = enabled && listed;
            const numericId = this.safeInteger (currency, 'id');
            const fee = this.safeNumber (currency, 'txFee');
            result[code] = {
                'id': id,
                'numericId': numericId,
                'code': code,
                'info': currency,
                'name': currency['name'],
                'active': active,
                'deposit': undefined,
                'withdraw': undefined,
                'fee': fee,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': this.parseNumber (amountLimit),
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': fee,
                        'max': undefined,
                    },
                },
            };
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        /**
         * @method
         * @name poloniex#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {str} symbol unified symbol of the market to fetch the ticker for
         * @param {dict} params extra parameters specific to the poloniex api endpoint
         * @returns {dict} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const response = await this.publicGetReturnTicker (params);
        // {
        //     "BTC_BTS":{
        //        "id":14,
        //        "last":"0.00000073",
        //        "lowestAsk":"0.00000075",
        //        "highestBid":"0.00000073",
        //        "percentChange":"0.01388888",
        //        "baseVolume":"0.01413528",
        //        "quoteVolume":"19431.16872167",
        //        "isFrozen":"0",
        //        "postOnly":"0",
        //        "marginTradingEnabled":"0",
        //        "high24hr":"0.00000074",
        //        "low24hr":"0.00000071"
        //     },
        //     ...
        // }
        const ticker = response[market['id']];
        return this.parseTicker (ticker, market);
    }

    parseTrade (trade, market = undefined) {
        //
        // fetchTrades
        //
        //      {
        //          globalTradeID: "667563407",
        //          tradeID: "1984256",
        //          date: "2022-03-01 20:06:06",
        //          type: "buy",
        //          rate: "0.13361871",
        //          amount: "28.40841257",
        //          total: "3.79589544",
        //          orderNumber: "159992152911"
        //      }
        //
        // fetchMyTrades
        //
        //     {
        //       globalTradeID: 471030550,
        //       tradeID: '42582',
        //       date: '2020-06-16 09:47:50',
        //       rate: '0.000079980000',
        //       amount: '75215.00000000',
        //       total: '6.01569570',
        //       fee: '0.00095000',
        //       feeDisplay: '0.26636100 TRX (0.07125%)',
        //       orderNumber: '5963454848',
        //       type: 'sell',
        //       category: 'exchange'
        //     }
        //
        // createOrder (taker trades)
        //
        //     {
        //         'amount': '200.00000000',
        //         'date': '2019-12-15 16:04:10',
        //         'rate': '0.00000355',
        //         'total': '0.00071000',
        //         'tradeID': '119871',
        //         'type': 'buy',
        //         'takerAdjustment': '200.00000000'
        //     }
        //
        const id = this.safeString2 (trade, 'globalTradeID', 'tradeID');
        const orderId = this.safeString (trade, 'orderNumber');
        const timestamp = this.parse8601 (this.safeString (trade, 'date'));
        const marketId = this.safeString (trade, 'currencyPair');
        market = this.safeMarket (marketId, market, '_');
        const symbol = market['symbol'];
        const side = this.safeString (trade, 'type');
        let fee = undefined;
        const priceString = this.safeString (trade, 'rate');
        const amountString = this.safeString (trade, 'amount');
        const costString = this.safeString (trade, 'total');
        const feeDisplay = this.safeString (trade, 'feeDisplay');
        if (feeDisplay !== undefined) {
            const parts = feeDisplay.split (' ');
            const feeCostString = this.safeString (parts, 0);
            if (feeCostString !== undefined) {
                const feeCurrencyId = this.safeString (parts, 1);
                const feeCurrencyCode = this.safeCurrencyCode (feeCurrencyId);
                let feeRateString = this.safeString (parts, 2);
                if (feeRateString !== undefined) {
                    feeRateString = feeRateString.replace ('(', '');
                    const feeRateParts = feeRateString.split ('%');
                    feeRateString = this.safeString (feeRateParts, 0);
                    feeRateString = Precise.stringDiv (feeRateString, '100');
                }
                fee = {
                    'cost': feeCostString,
                    'currency': feeCurrencyCode,
                    'rate': feeRateString,
                };
            }
        } else {
            const feeCostString = this.safeString (trade, 'fee');
            if (feeCostString !== undefined && market !== undefined) {
                const feeCurrencyCode = (side === 'buy') ? market['base'] : market['quote'];
                const feeBase = (side === 'buy') ? amountString : costString;
                const feeRateString = Precise.stringDiv (feeCostString, feeBase);
                fee = {
                    'cost': feeCostString,
                    'currency': feeCurrencyCode,
                    'rate': feeRateString,
                };
            }
        }
        let takerOrMaker = undefined;
        const takerAdjustment = this.safeNumber (trade, 'takerAdjustment');
        if (takerAdjustment !== undefined) {
            takerOrMaker = 'taker';
        }
        return this.safeTrade ({
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': orderId,
            'type': 'limit',
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': priceString,
            'amount': amountString,
            'cost': costString,
            'fee': fee,
        }, market);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name poloniex#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {str} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {dict} params extra parameters specific to the poloniex api endpoint
         * @returns {[dict]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'currencyPair': market['id'],
        };
        if (since !== undefined) {
            request['start'] = parseInt (since / 1000);
            request['end'] = this.seconds (); // last 50000 trades by default
        }
        const trades = await this.publicGetReturnTradeHistory (this.extend (request, params));
        return this.parseTrades (trades, market, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const pair = market ? market['id'] : 'all';
        const request = { 'currencyPair': pair };
        if (since !== undefined) {
            request['start'] = parseInt (since / 1000);
            request['end'] = this.sum (this.seconds (), 1); // adding 1 is a fix for #3411
        }
        // limit is disabled (does not really work as expected)
        if (limit !== undefined) {
            request['limit'] = parseInt (limit);
        }
        const response = await this.privatePostReturnTradeHistory (this.extend (request, params));
        //
        // specific market (symbol defined)
        //
        //     [
        //         {
        //             globalTradeID: 470912587,
        //             tradeID: '42543',
        //             date: '2020-06-15 17:31:22',
        //             rate: '0.000083840000',
        //             amount: '95237.60321429',
        //             total: '7.98472065',
        //             fee: '0.00095000',
        //             feeDisplay: '0.36137761 TRX (0.07125%)',
        //             orderNumber: '5926344995',
        //             type: 'sell',
        //             category: 'exchange'
        //         },
        //         {
        //             globalTradeID: 470974497,
        //             tradeID: '42560',
        //             date: '2020-06-16 00:41:23',
        //             rate: '0.000078220000',
        //             amount: '1000000.00000000',
        //             total: '78.22000000',
        //             fee: '0.00095000',
        //             feeDisplay: '3.48189819 TRX (0.07125%)',
        //             orderNumber: '5945490830',
        //             type: 'sell',
        //             category: 'exchange'
        //         }
        //     ]
        //
        // all markets (symbol undefined)
        //
        //     {
        //        BTC_GNT: [{
        //             globalTradeID: 470839947,
        //             tradeID: '4322347',
        //             date: '2020-06-15 12:25:24',
        //             rate: '0.000005810000',
        //             amount: '1702.04429303',
        //             total: '0.00988887',
        //             fee: '0.00095000',
        //             feeDisplay: '4.18235294 TRX (0.07125%)',
        //             orderNumber: '102290272520',
        //             type: 'buy',
        //             category: 'exchange'
        //     }, {
        //             globalTradeID: 470895902,
        //             tradeID: '4322413',
        //             date: '2020-06-15 16:19:00',
        //             rate: '0.000005980000',
        //             amount: '18.66879219',
        //             total: '0.00011163',
        //             fee: '0.00095000',
        //             feeDisplay: '0.04733727 TRX (0.07125%)',
        //             orderNumber: '102298304480',
        //             type: 'buy',
        //             category: 'exchange'
        //         }],
        //     }
        //
        let result = [];
        if (market !== undefined) {
            result = this.parseTrades (response, market);
        } else {
            if (response) {
                const ids = Object.keys (response);
                for (let i = 0; i < ids.length; i++) {
                    const id = ids[i];
                    let market = undefined;
                    if (id in this.markets_by_id) {
                        market = this.markets_by_id[id];
                        const trades = this.parseTrades (response[id], market);
                        for (let j = 0; j < trades.length; j++) {
                            result.push (trades[j]);
                        }
                    } else {
                        const [ quoteId, baseId ] = id.split ('_');
                        const base = this.safeCurrencyCode (baseId);
                        const quote = this.safeCurrencyCode (quoteId);
                        const symbol = base + '/' + quote;
                        const trades = response[id];
                        for (let j = 0; j < trades.length; j++) {
                            const market = {
                                'symbol': symbol,
                                'base': base,
                                'quote': quote,
                            };
                            result.push (this.parseTrade (trades[j], market));
                        }
                    }
                }
            }
        }
        return this.filterBySinceLimit (result, since, limit);
    }

    parseOrderStatus (status) {
        const statuses = {
            'Open': 'open',
            'Partially filled': 'open',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        //
        // fetchOpenOrder
        //
        //     {
        //         status: 'Open',
        //         rate: '0.40000000',
        //         amount: '1.00000000',
        //         currencyPair: 'BTC_ETH',
        //         date: '2018-10-17 17:04:50',
        //         total: '0.40000000',
        //         type: 'buy',
        //         startingAmount: '1.00000',
        //     }
        //
        // fetchOpenOrders
        //
        //     {
        //         orderNumber: '514514894224',
        //         type: 'buy',
        //         rate: '0.00001000',
        //         startingAmount: '100.00000000',
        //         amount: '100.00000000',
        //         total: '0.00100000',
        //         date: '2018-10-23 17:38:53',
        //         margin: 0,
        //     }
        //
        // createOrder
        //
        //     {
        //         'orderNumber': '9805453960',
        //         'resultingTrades': [
        //             {
        //                 'amount': '200.00000000',
        //                 'date': '2019-12-15 16:04:10',
        //                 'rate': '0.00000355',
        //                 'total': '0.00071000',
        //                 'tradeID': '119871',
        //                 'type': 'buy',
        //                 'takerAdjustment': '200.00000000',
        //             },
        //         ],
        //         'fee': '0.00000000',
        //         'clientOrderId': '12345',
        //         'currencyPair': 'BTC_MANA',
        //         // 'resultingTrades' in editOrder
        //         'resultingTrades': {
        //             'BTC_MANA': [],
        //          }
        //     }
        //
        let timestamp = this.safeInteger (order, 'timestamp');
        if (timestamp === undefined) {
            timestamp = this.parse8601 (this.safeString (order, 'date'));
        }
        const marketId = this.safeString (order, 'currencyPair');
        market = this.safeMarket (marketId, market, '_');
        const symbol = market['symbol'];
        let resultingTrades = this.safeValue (order, 'resultingTrades');
        if (!Array.isArray (resultingTrades)) {
            resultingTrades = this.safeValue (resultingTrades, this.safeString (market, 'id', marketId));
        }
        const price = this.safeString2 (order, 'price', 'rate');
        const remaining = this.safeString (order, 'amount');
        const amount = this.safeString (order, 'startingAmount');
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        const side = this.safeString (order, 'type');
        const id = this.safeString (order, 'orderNumber');
        let fee = undefined;
        const feeCurrency = this.safeString (order, 'tokenFeeCurrency');
        let feeCost = undefined;
        let feeCurrencyCode = undefined;
        const rate = this.safeString (order, 'fee');
        if (feeCurrency === undefined) {
            feeCurrencyCode = (side === 'buy') ? market['base'] : market['quote'];
        } else {
            // poloniex accepts a 30% discount to pay fees in TRX
            feeCurrencyCode = this.safeCurrencyCode (feeCurrency);
            feeCost = this.safeString (order, 'tokenFee');
        }
        if (feeCost !== undefined) {
            fee = {
                'rate': rate,
                'cost': feeCost,
                'currency': feeCurrencyCode,
            };
        }
        const clientOrderId = this.safeString (order, 'clientOrderId');
        return this.safeOrder ({
            'info': order,
            'id': id,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': symbol,
            'type': 'limit',
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': undefined,
            'cost': undefined,
            'average': undefined,
            'amount': amount,
            'filled': undefined,
            'remaining': remaining,
            'trades': resultingTrades,
            'fee': fee,
        }, market);
    }

    parseOpenOrders (orders, market, result) {
        for (let i = 0; i < orders.length; i++) {
            const order = orders[i];
            const extended = this.extend (order, {
                'status': 'open',
                'type': 'limit',
                'side': order['type'],
                'price': order['rate'],
            });
            result.push (this.parseOrder (extended, market));
        }
        return result;
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const pair = market ? market['id'] : 'all';
        const request = {
            'currencyPair': pair,
        };
        const response = await this.privatePostReturnOpenOrders (this.extend (request, params));
        const extension = { 'status': 'open' };
        if (market === undefined) {
            const marketIds = Object.keys (response);
            let openOrders = [];
            for (let i = 0; i < marketIds.length; i++) {
                const marketId = marketIds[i];
                const orders = response[marketId];
                const m = this.markets_by_id[marketId];
                openOrders = this.arrayConcat (openOrders, this.parseOrders (orders, m, undefined, undefined, extension));
            }
            return this.filterBySinceLimit (openOrders, since, limit);
        } else {
            return this.parseOrders (response, market, since, limit, extension);
        }
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        if (type === 'market') {
            throw new ExchangeError (this.id + ' createOrder() does not accept market orders');
        }
        await this.loadMarkets ();
        const method = 'privatePost' + this.capitalize (side);
        const market = this.market (symbol);
        amount = this.amountToPrecision (symbol, amount);
        const request = {
            'currencyPair': market['id'],
            'rate': this.priceToPrecision (symbol, price),
            'amount': amount,
        };
        const clientOrderId = this.safeString (params, 'clientOrderId');
        if (clientOrderId !== undefined) {
            request['clientOrderId'] = clientOrderId;
            params = this.omit (params, 'clientOrderId');
        }
        // remember the timestamp before issuing the request
        let response = await this[method] (this.extend (request, params));
        //
        //     {
        //         'orderNumber': '9805453960',
        //         'resultingTrades': [
        //             {
        //                 'amount': '200.00000000',
        //                 'date': '2019-12-15 16:04:10',
        //                 'rate': '0.00000355',
        //                 'total': '0.00071000',
        //                 'tradeID': '119871',
        //                 'type': 'buy',
        //                 'takerAdjustment': '200.00000000',
        //             },
        //         ],
        //         'fee': '0.00000000',
        //         'currencyPair': 'BTC_MANA',
        //     }
        //
        response = this.extend (response, {
            'type': side,
        });
        return this.parseOrder (response, market);
    }

    async editOrder (id, symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        price = parseFloat (price);
        const request = {
            'orderNumber': id,
            'rate': this.priceToPrecision (symbol, price),
        };
        if (amount !== undefined) {
            request['amount'] = this.amountToPrecision (symbol, amount);
        }
        const response = await this.privatePostMoveOrder (this.extend (request, params));
        return this.parseOrder (response);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        const clientOrderId = this.safeValue (params, 'clientOrderId');
        if (clientOrderId === undefined) {
            request['orderNumber'] = id;
        } else {
            request['clientOrderId'] = clientOrderId;
        }
        params = this.omit (params, 'clientOrderId');
        return await this.privatePostCancelOrder (this.extend (request, params));
    }

    async cancelAllOrders (symbol = undefined, params = {}) {
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['currencyPair'] = market['id'];
        }
        const response = await this.privatePostCancelAllOrders (this.extend (request, params));
        //
        //     {
        //         "success": 1,
        //         "message": "Orders canceled",
        //         "orderNumbers": [
        //             503749,
        //             888321,
        //             7315825,
        //             7316824
        //         ]
        //     }
        //
        return response;
    }

    async fetchOpenOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        id = id.toString ();
        const request = {
            'orderNumber': id,
        };
        const response = await this.privatePostReturnOrderStatus (this.extend (request, params));
        //
        //     {
        //         success: 1,
        //         result: {
        //             '6071071': {
        //                 status: 'Open',
        //                 rate: '0.40000000',
        //                 amount: '1.00000000',
        //                 currencyPair: 'BTC_ETH',
        //                 date: '2018-10-17 17:04:50',
        //                 total: '0.40000000',
        //                 type: 'buy',
        //                 startingAmount: '1.00000',
        //             },
        //         },
        //     }
        //
        const result = this.safeValue (response['result'], id);
        if (result === undefined) {
            throw new OrderNotFound (this.id + ' order id ' + id + ' not found');
        }
        return this.extend (this.parseOrder (result), {
            'id': id,
        });
    }

    async fetchClosedOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'orderNumber': id,
        };
        const response = await this.privatePostReturnOrderTrades (this.extend (request, params));
        //
        //     [
        //         {
        //             "globalTradeID":570264000,
        //             "tradeID":8026283,
        //             "currencyPair":"USDT_LTC",
        //             "type":"sell",
        //             "rate":"144.73833409",
        //             "amount":"0.18334460",
        //             "total":"26.53699196",
        //             "fee":"0.00155000",
        //             "date":"2021-07-04 15:16:20"
        //         }
        //     ]
        //
        const firstTrade = this.safeValue (response, 0);
        if (firstTrade === undefined) {
            throw new OrderNotFound (this.id + ' order id ' + id + ' not found');
        }
        id = this.safeValue (firstTrade, 'globalTradeID', id);
        return this.safeOrder ({
            'info': response,
            'id': id,
            'clientOrderId': this.safeValue (firstTrade, 'clientOrderId'),
            'timestamp': undefined,
            'datetime': undefined,
            'lastTradeTimestamp': undefined,
            'status': 'closed',
            'symbol': undefined,
            'type': undefined,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': undefined,
            'price': undefined,
            'stopPrice': undefined,
            'cost': undefined,
            'average': undefined,
            'amount': undefined,
            'filled': undefined,
            'remaining': undefined,
            'trades': response,
            'fee': undefined,
        });
    }

    async fetchOrderStatus (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const orders = await this.fetchOpenOrders (symbol, undefined, undefined, params);
        const indexed = this.indexBy (orders, 'id');
        return (id in indexed) ? 'open' : 'closed';
    }

    async fetchOrderTrades (id, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'orderNumber': id,
        };
        const trades = await this.privatePostReturnOrderTrades (this.extend (request, params));
        return this.parseTrades (trades);
    }

    async createDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        // USDT, USDTETH, USDTTRON
        let currencyId = undefined;
        let currency = undefined;
        if (code in this.currencies) {
            currency = this.currency (code);
            currencyId = currency['id'];
        } else {
            currencyId = code;
        }
        const request = {
            'currency': currencyId,
        };
        const response = await this.privatePostGenerateNewAddress (this.extend (request, params));
        let address = undefined;
        let tag = undefined;
        const success = this.safeString (response, 'success');
        if (success === '1') {
            address = this.safeString (response, 'response');
        }
        this.checkAddress (address);
        if (currency !== undefined) {
            const depositAddress = this.safeString (currency['info'], 'depositAddress');
            if (depositAddress !== undefined) {
                tag = address;
                address = depositAddress;
            }
        }
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'info': response,
        };
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const response = await this.privatePostReturnDepositAddresses (params);
        // USDT, USDTETH, USDTTRON
        let currencyId = undefined;
        let currency = undefined;
        if (code in this.currencies) {
            currency = this.currency (code);
            currencyId = currency['id'];
        } else {
            currencyId = code;
        }
        let address = this.safeString (response, currencyId);
        let tag = undefined;
        this.checkAddress (address);
        if (currency !== undefined) {
            const depositAddress = this.safeString (currency['info'], 'depositAddress');
            if (depositAddress !== undefined) {
                tag = address;
                address = depositAddress;
            }
        }
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'network': undefined,
            'info': response,
        };
    }

    async transfer (code, amount, fromAccount, toAccount, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        amount = this.currencyToPrecision (code, amount);
        const accountsByType = this.safeValue (this.options, 'accountsByType', {});
        const fromId = this.safeString (accountsByType, fromAccount, fromAccount);
        const toId = this.safeString (accountsByType, toAccount, fromAccount);
        const request = {
            'amount': amount,
            'currency': currency['id'],
            'fromAccount': fromId,
            'toAccount': toId,
        };
        const response = await this.privatePostTransferBalance (this.extend (request, params));
        //
        //    {
        //        success: '1',
        //        message: 'Transferred 1.00000000 USDT from exchange to lending account.'
        //    }
        //
        return this.parseTransfer (response, currency);
    }

    parseTransferStatus (status) {
        const statuses = {
            '1': 'ok',
        };
        return this.safeString (statuses, status, status);
    }

    parseTransfer (transfer, currency = undefined) {
        //
        //    {
        //        success: '1',
        //        message: 'Transferred 1.00000000 USDT from exchange to lending account.'
        //    }
        //
        const message = this.safeString (transfer, 'message');
        const words = message.split (' ');
        const amount = this.safeNumber (words, 1);
        const currencyId = this.safeString (words, 2);
        const fromAccountId = this.safeString (words, 4);
        const toAccountId = this.safeString (words, 6);
        const accountsById = this.safeValue (this.options, 'accountsById', {});
        return {
            'info': transfer,
            'id': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'currency': this.safeCurrencyCode (currencyId, currency),
            'amount': amount,
            'fromAccount': this.safeString (accountsById, fromAccountId),
            'toAccount': this.safeString (accountsById, toAccountId),
            'status': this.parseOrderStatus (this.safeString (transfer, 'success', 'failed')),
        };
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        [ tag, params ] = this.handleWithdrawTagAndParams (tag, params);
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
            'amount': amount,
            'address': address,
        };
        if (tag !== undefined) {
            request['paymentId'] = tag;
        }
        const networks = this.safeValue (this.options, 'networks', {});
        let network = this.safeStringUpper (params, 'network'); // this line allows the user to specify either ERC20 or ETH
        network = this.safeString (networks, network, network); // handle ERC20>ETH alias
        if (network !== undefined) {
            request['currency'] += network; // when network the currency need to be changed to currency+network https://docs.poloniex.com/#withdraw on MultiChain Currencies section
            params = this.omit (params, 'network');
        }
        const response = await this.privatePostWithdraw (this.extend (request, params));
        //
        //     {
        //         response: 'Withdrew 1.00000000 USDT.',
        //         email2FA: false,
        //         withdrawalNumber: 13449869
        //     }
        //
        return this.parseTransaction (response, currency);
    }

    async fetchTransactionsHelper (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const year = 31104000; // 60 * 60 * 24 * 30 * 12 = one year of history, why not
        const now = this.seconds ();
        const start = (since !== undefined) ? parseInt (since / 1000) : now - 10 * year;
        const request = {
            'start': start, // UNIX timestamp, required
            'end': now, // UNIX timestamp, required
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privatePostReturnDepositsWithdrawals (this.extend (request, params));
        //
        //     {
        //         "adjustments":[],
        //         "deposits":[
        //             {
        //                 currency: "BTC",
        //                 address: "1MEtiqJWru53FhhHrfJPPvd2tC3TPDVcmW",
        //                 amount: "0.01063000",
        //                 confirmations:  1,
        //                 txid: "952b0e1888d6d491591facc0d37b5ebec540ac1efb241fdbc22bcc20d1822fb6",
        //                 timestamp:  1507916888,
        //                 status: "COMPLETE"
        //             },
        //             {
        //                 currency: "ETH",
        //                 address: "0x20108ba20b65c04d82909e91df06618107460197",
        //                 amount: "4.00000000",
        //                 confirmations: 38,
        //                 txid: "0x4be260073491fe63935e9e0da42bd71138fdeb803732f41501015a2d46eb479d",
        //                 timestamp: 1525060430,
        //                 status: "COMPLETE"
        //             }
        //         ],
        //         "withdrawals":[
        //             {
        //                 "withdrawalNumber":13449869,
        //                 "currency":"USDTTRON", // not documented in API docs, see commonCurrencies in describe()
        //                 "address":"TXGaqPW23JdRWhsVwS2mRsGsegbdnAd3Rw",
        //                 "amount":"1.00000000",
        //                 "fee":"0.00000000",
        //                 "timestamp":1591573420,
        //                 "status":"COMPLETE: dadf427224b3d44b38a2c13caa4395e4666152556ca0b2f67dbd86a95655150f",
        //                 "ipAddress":"x.x.x.x",
        //                 "canCancel":0,
        //                 "canResendEmail":0,
        //                 "paymentID":null,
        //                 "scope":"crypto"
        //             },
        //             {
        //                 withdrawalNumber: 8224394,
        //                 currency: "EMC2",
        //                 address: "EYEKyCrqTNmVCpdDV8w49XvSKRP9N3EUyF",
        //                 amount: "63.10796020",
        //                 fee: "0.01000000",
        //                 timestamp: 1510819838,
        //                 status: "COMPLETE: d37354f9d02cb24d98c8c4fc17aa42f475530b5727effdf668ee5a43ce667fd6",
        //                 ipAddress: "x.x.x.x"
        //             },
        //             {
        //                 withdrawalNumber: 9290444,
        //                 currency: "ETH",
        //                 address: "0x191015ff2e75261d50433fbd05bd57e942336149",
        //                 amount: "0.15500000",
        //                 fee: "0.00500000",
        //                 timestamp: 1514099289,
        //                 status: "COMPLETE: 0x12d444493b4bca668992021fd9e54b5292b8e71d9927af1f076f554e4bea5b2d",
        //                 ipAddress: "x.x.x.x"
        //             },
        //             {
        //                 withdrawalNumber: 11518260,
        //                 currency: "BTC",
        //                 address: "8JoDXAmE1GY2LRK8jD1gmAmgRPq54kXJ4t",
        //                 amount: "0.20000000",
        //                 fee: "0.00050000",
        //                 timestamp: 1527918155,
        //                 status: "COMPLETE: 1864f4ebb277d90b0b1ff53259b36b97fa1990edc7ad2be47c5e0ab41916b5ff",
        //                 ipAddress: "x.x.x.x"
        //             }
        //         ]
        //     }
        //
        return response;
    }

    async fetchTransactions (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.fetchTransactionsHelper (code, since, limit, params);
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
        }
        const withdrawals = this.safeValue (response, 'withdrawals', []);
        const deposits = this.safeValue (response, 'deposits', []);
        const withdrawalTransactions = this.parseTransactions (withdrawals, currency, since, limit);
        const depositTransactions = this.parseTransactions (deposits, currency, since, limit);
        const transactions = this.arrayConcat (depositTransactions, withdrawalTransactions);
        return this.filterByCurrencySinceLimit (this.sortBy (transactions, 'timestamp'), code, since, limit);
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        const response = await this.fetchTransactionsHelper (code, since, limit, params);
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
        }
        const withdrawals = this.safeValue (response, 'withdrawals', []);
        const transactions = this.parseTransactions (withdrawals, currency, since, limit);
        return this.filterByCurrencySinceLimit (transactions, code, since, limit);
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        const response = await this.fetchTransactionsHelper (code, since, limit, params);
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
        }
        const deposits = this.safeValue (response, 'deposits', []);
        const transactions = this.parseTransactions (deposits, currency, since, limit);
        return this.filterByCurrencySinceLimit (transactions, code, since, limit);
    }

    parseTransactionStatus (status) {
        const statuses = {
            'COMPLETE': 'ok',
            'AWAITING APPROVAL': 'pending',
            'PENDING': 'pending',
            'PROCESSING': 'pending',
            'COMPLETE ERROR': 'failed',
        };
        return this.safeString (statuses, status, status);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        // deposits
        //
        //     {
        //         "txid": "f49d489616911db44b740612d19464521179c76ebe9021af85b6de1e2f8d68cd",
        //         "type": "deposit",
        //         "amount": "49798.01987021",
        //         "status": "COMPLETE",
        //         "address": "DJVJZ58tJC8UeUv9Tqcdtn6uhWobouxFLT",
        //         "currency": "DOGE",
        //         "timestamp": 1524321838,
        //         "confirmations": 3371,
        //         "depositNumber": 134587098
        //     }
        //
        // withdrawals
        //
        //     {
        //         "fee": "0.00050000",
        //         "type": "withdrawal",
        //         "amount": "0.40234387",
        //         "status": "COMPLETE: fbabb2bf7d81c076f396f3441166d5f60f6cea5fdfe69e02adcc3b27af8c2746",
        //         "address": "1EdAqY4cqHoJGAgNfUFER7yZpg1Jc9DUa3",
        //         "currency": "BTC",
        //         "canCancel": 0,
        //         "ipAddress": "x.x.x.x",
        //         "paymentID": null,
        //         "timestamp": 1523834337,
        //         "canResendEmail": 0,
        //         "withdrawalNumber": 11162900
        //     }
        //
        // withdraw
        //
        //     {
        //         response: 'Withdrew 1.00000000 USDT.',
        //         email2FA: false,
        //         withdrawalNumber: 13449869
        //     }
        //
        const timestamp = this.safeTimestamp (transaction, 'timestamp');
        const currencyId = this.safeString (transaction, 'currency');
        const code = this.safeCurrencyCode (currencyId);
        let status = this.safeString (transaction, 'status', 'pending');
        let txid = this.safeString (transaction, 'txid');
        if (status !== undefined) {
            const parts = status.split (': ');
            const numParts = parts.length;
            status = parts[0];
            if ((numParts > 1) && (txid === undefined)) {
                txid = parts[1];
            }
            status = this.parseTransactionStatus (status);
        }
        const defaultType = ('withdrawalNumber' in transaction) ? 'withdrawal' : 'deposit';
        const type = this.safeString (transaction, 'type', defaultType);
        const id = this.safeString2 (transaction, 'withdrawalNumber', 'depositNumber');
        let amount = this.safeNumber (transaction, 'amount');
        const address = this.safeString (transaction, 'address');
        const tag = this.safeString (transaction, 'paymentID');
        // according to https://poloniex.com/fees/
        const feeCost = this.safeNumber (transaction, 'fee', 0);
        if (type === 'withdrawal') {
            // poloniex withdrawal amount includes the fee
            amount = amount - feeCost;
        }
        return {
            'info': transaction,
            'id': id,
            'currency': code,
            'amount': amount,
            'network': undefined,
            'address': address,
            'addressTo': undefined,
            'addressFrom': undefined,
            'tag': tag,
            'tagTo': undefined,
            'tagFrom': undefined,
            'status': status,
            'type': type,
            'updated': undefined,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'fee': {
                'currency': code,
                'cost': feeCost,
            },
        };
    }

    async fetchPosition (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'currencyPair': market['id'],
        };
        const response = await this.privatePostGetMarginPosition (this.extend (request, params));
        //
        //     {
        //         type: "none",
        //         amount: "0.00000000",
        //         total: "0.00000000",
        //         basePrice: "0.00000000",
        //         liquidationPrice: -1,
        //         pl: "0.00000000",
        //         lendingFees: "0.00000000"
        //     }
        //
        // todo unify parsePosition/parsePositions
        return response;
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api];
        const query = this.extend ({ 'command': path }, params);
        if (api === 'public') {
            url += '?' + this.urlencode (query);
        } else {
            this.checkRequiredCredentials ();
            query['nonce'] = this.nonce ();
            body = this.urlencode (query);
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Key': this.apiKey,
                'Sign': this.hmac (this.encode (body), this.encode (this.secret), 'sha512'),
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return;
        }
        // {"error":"Permission denied."}
        if ('error' in response) {
            const message = response['error'];
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
            throw new ExchangeError (feedback); // unknown message
        }
    }
};
