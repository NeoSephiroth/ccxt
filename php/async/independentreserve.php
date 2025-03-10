<?php

namespace ccxt\async;

// PLEASE DO NOT EDIT THIS FILE, IT IS GENERATED AND WILL BE OVERWRITTEN:
// https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code

use Exception; // a common import
use \ccxt\Precise;

class independentreserve extends Exchange {

    public function describe() {
        return $this->deep_extend(parent::describe (), array(
            'id' => 'independentreserve',
            'name' => 'Independent Reserve',
            'countries' => array( 'AU', 'NZ' ), // Australia, New Zealand
            'rateLimit' => 1000,
            'has' => array(
                'CORS' => null,
                'spot' => true,
                'margin' => false,
                'swap' => false,
                'future' => false,
                'option' => false,
                'addMargin' => false,
                'cancelOrder' => true,
                'createOrder' => true,
                'createReduceOnlyOrder' => false,
                'fetchBalance' => true,
                'fetchBorrowRate' => false,
                'fetchBorrowRateHistories' => false,
                'fetchBorrowRateHistory' => false,
                'fetchBorrowRates' => false,
                'fetchBorrowRatesPerSymbol' => false,
                'fetchClosedOrders' => true,
                'fetchFundingHistory' => false,
                'fetchFundingRate' => false,
                'fetchFundingRateHistory' => false,
                'fetchFundingRates' => false,
                'fetchIndexOHLCV' => false,
                'fetchLeverage' => false,
                'fetchLeverageTiers' => false,
                'fetchMarkets' => true,
                'fetchMarkOHLCV' => false,
                'fetchMyTrades' => true,
                'fetchOpenInterestHistory' => false,
                'fetchOpenOrders' => true,
                'fetchOrder' => true,
                'fetchOrderBook' => true,
                'fetchPosition' => false,
                'fetchPositions' => false,
                'fetchPositionsRisk' => false,
                'fetchPremiumIndexOHLCV' => false,
                'fetchTicker' => true,
                'fetchTrades' => true,
                'fetchTradingFee' => false,
                'fetchTradingFees' => true,
                'reduceMargin' => false,
                'setLeverage' => false,
                'setMarginMode' => false,
                'setPositionMode' => false,
            ),
            'urls' => array(
                'logo' => 'https://user-images.githubusercontent.com/51840849/87182090-1e9e9080-c2ec-11ea-8e49-563db9a38f37.jpg',
                'api' => array(
                    'public' => 'https://api.independentreserve.com/Public',
                    'private' => 'https://api.independentreserve.com/Private',
                ),
                'www' => 'https://www.independentreserve.com',
                'doc' => 'https://www.independentreserve.com/API',
            ),
            'api' => array(
                'public' => array(
                    'get' => array(
                        'GetValidPrimaryCurrencyCodes',
                        'GetValidSecondaryCurrencyCodes',
                        'GetValidLimitOrderTypes',
                        'GetValidMarketOrderTypes',
                        'GetValidOrderTypes',
                        'GetValidTransactionTypes',
                        'GetMarketSummary',
                        'GetOrderBook',
                        'GetAllOrders',
                        'GetTradeHistorySummary',
                        'GetRecentTrades',
                        'GetFxRates',
                        'GetOrderMinimumVolumes',
                        'GetCryptoWithdrawalFees',
                    ),
                ),
                'private' => array(
                    'post' => array(
                        'GetOpenOrders',
                        'GetClosedOrders',
                        'GetClosedFilledOrders',
                        'GetOrderDetails',
                        'GetAccounts',
                        'GetTransactions',
                        'GetFiatBankAccounts',
                        'GetDigitalCurrencyDepositAddress',
                        'GetDigitalCurrencyDepositAddresses',
                        'GetTrades',
                        'GetBrokerageFees',
                        'GetDigitalCurrencyWithdrawal',
                        'PlaceLimitOrder',
                        'PlaceMarketOrder',
                        'CancelOrder',
                        'SynchDigitalCurrencyDepositAddressWithBlockchain',
                        'RequestFiatWithdrawal',
                        'WithdrawFiatCurrency',
                        'WithdrawDigitalCurrency',
                    ),
                ),
            ),
            'fees' => array(
                'trading' => array(
                    'taker' => 0.5 / 100,
                    'maker' => 0.5 / 100,
                    'percentage' => true,
                    'tierBased' => false,
                ),
            ),
            'commonCurrencies' => array(
                'PLA' => 'PlayChip',
            ),
        ));
    }

    public function fetch_markets($params = array ()) {
        /**
         * retrieves data on all markets for independentreserve
         * @param {dict} $params extra parameters specific to the exchange api endpoint
         * @return {[dict]} an array of objects representing market data
         */
        $baseCurrencies = yield $this->publicGetGetValidPrimaryCurrencyCodes ($params);
        $quoteCurrencies = yield $this->publicGetGetValidSecondaryCurrencyCodes ($params);
        $limits = yield $this->publicGetGetOrderMinimumVolumes ($params);
        //
        //     {
        //         "Xbt" => 0.0001,
        //         "Bch" => 0.001,
        //         "Bsv" => 0.001,
        //         "Eth" => 0.001,
        //         "Ltc" => 0.01,
        //         "Xrp" => 1,
        //     }
        //
        $result = array();
        for ($i = 0; $i < count($baseCurrencies); $i++) {
            $baseId = $baseCurrencies[$i];
            $base = $this->safe_currency_code($baseId);
            $minAmount = $this->safe_number($limits, $baseId);
            for ($j = 0; $j < count($quoteCurrencies); $j++) {
                $quoteId = $quoteCurrencies[$j];
                $quote = $this->safe_currency_code($quoteId);
                $id = $baseId . '/' . $quoteId;
                $result[] = array(
                    'id' => $id,
                    'symbol' => $base . '/' . $quote,
                    'base' => $base,
                    'quote' => $quote,
                    'settle' => null,
                    'baseId' => $baseId,
                    'quoteId' => $quoteId,
                    'settleId' => null,
                    'type' => 'spot',
                    'spot' => true,
                    'margin' => false,
                    'swap' => false,
                    'future' => false,
                    'option' => false,
                    'active' => null,
                    'contract' => false,
                    'linear' => null,
                    'inverse' => null,
                    'contractSize' => null,
                    'expiry' => null,
                    'expiryDatetime' => null,
                    'strike' => null,
                    'optionType' => null,
                    'precision' => $this->precision,
                    'limits' => array(
                        'leverage' => array(
                            'min' => null,
                            'max' => null,
                        ),
                        'amount' => array(
                            'min' => $minAmount,
                            'max' => null,
                        ),
                        'price' => array(
                            'min' => null,
                            'max' => null,
                        ),
                        'cost' => array(
                            'min' => null,
                            'max' => null,
                        ),
                    ),
                    'info' => $id,
                );
            }
        }
        return $result;
    }

    public function parse_balance($response) {
        $result = array( 'info' => $response );
        for ($i = 0; $i < count($response); $i++) {
            $balance = $response[$i];
            $currencyId = $this->safe_string($balance, 'CurrencyCode');
            $code = $this->safe_currency_code($currencyId);
            $account = $this->account();
            $account['free'] = $this->safe_string($balance, 'AvailableBalance');
            $account['total'] = $this->safe_string($balance, 'TotalBalance');
            $result[$code] = $account;
        }
        return $this->safe_balance($result);
    }

    public function fetch_balance($params = array ()) {
        /**
         * query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {dict} $params extra parameters specific to the independentreserve api endpoint
         * @return {dict} a ~@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure balance structure~
         */
        yield $this->load_markets();
        $response = yield $this->privatePostGetAccounts ($params);
        return $this->parse_balance($response);
    }

    public function fetch_order_book($symbol, $limit = null, $params = array ()) {
        /**
         * fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {str} $symbol unified $symbol of the $market to fetch the order book for
         * @param {int|null} $limit the maximum amount of order book entries to return
         * @param {dict} $params extra parameters specific to the independentreserve api endpoint
         * @return {dict} A dictionary of {@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure order book structures} indexed by $market symbols
         */
        yield $this->load_markets();
        $market = $this->market($symbol);
        $request = array(
            'primaryCurrencyCode' => $market['baseId'],
            'secondaryCurrencyCode' => $market['quoteId'],
        );
        $response = yield $this->publicGetGetOrderBook (array_merge($request, $params));
        $timestamp = $this->parse8601($this->safe_string($response, 'CreatedTimestampUtc'));
        return $this->parse_order_book($response, $symbol, $timestamp, 'BuyOrders', 'SellOrders', 'Price', 'Volume');
    }

    public function parse_ticker($ticker, $market = null) {
        // {
        //     "DayHighestPrice":43489.49,
        //     "DayLowestPrice":41998.32,
        //     "DayAvgPrice":42743.9,
        //     "DayVolumeXbt":44.54515625000,
        //     "DayVolumeXbtInSecondaryCurrrency":0.12209818,
        //     "CurrentLowestOfferPrice":43619.64,
        //     "CurrentHighestBidPrice":43153.58,
        //     "LastPrice":43378.43,
        //     "PrimaryCurrencyCode":"Xbt",
        //     "SecondaryCurrencyCode":"Usd",
        //     "CreatedTimestampUtc":"2022-01-14T22:52:29.5029223Z"
        // }
        $timestamp = $this->parse8601($this->safe_string($ticker, 'CreatedTimestampUtc'));
        $baseId = $this->safe_string($ticker, 'PrimaryCurrencyCode');
        $quoteId = $this->safe_string($ticker, 'SecondaryCurrencyCode');
        $defaultMarketId = null;
        if (($baseId !== null) && ($quoteId !== null)) {
            $defaultMarketId = $baseId . '/' . $quoteId;
        }
        $market = $this->safe_market($defaultMarketId, $market, '/');
        $symbol = $market['symbol'];
        $last = $this->safe_string($ticker, 'LastPrice');
        return $this->safe_ticker(array(
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601($timestamp),
            'high' => $this->safe_string($ticker, 'DayHighestPrice'),
            'low' => $this->safe_string($ticker, 'DayLowestPrice'),
            'bid' => $this->safe_string($ticker, 'CurrentHighestBidPrice'),
            'bidVolume' => null,
            'ask' => $this->safe_string($ticker, 'CurrentLowestOfferPrice'),
            'askVolume' => null,
            'vwap' => null,
            'open' => null,
            'close' => $last,
            'last' => $last,
            'previousClose' => null,
            'change' => null,
            'percentage' => null,
            'average' => $this->safe_string($ticker, 'DayAvgPrice'),
            'baseVolume' => $this->safe_string($ticker, 'DayVolumeXbtInSecondaryCurrrency'),
            'quoteVolume' => null,
            'info' => $ticker,
        ), $market, false);
    }

    public function fetch_ticker($symbol, $params = array ()) {
        /**
         * fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific $market
         * @param {str} $symbol unified $symbol of the $market to fetch the ticker for
         * @param {dict} $params extra parameters specific to the independentreserve api endpoint
         * @return {dict} a {@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure ticker structure}
         */
        yield $this->load_markets();
        $market = $this->market($symbol);
        $request = array(
            'primaryCurrencyCode' => $market['baseId'],
            'secondaryCurrencyCode' => $market['quoteId'],
        );
        $response = yield $this->publicGetGetMarketSummary (array_merge($request, $params));
        // {
        //     "DayHighestPrice":43489.49,
        //     "DayLowestPrice":41998.32,
        //     "DayAvgPrice":42743.9,
        //     "DayVolumeXbt":44.54515625000,
        //     "DayVolumeXbtInSecondaryCurrrency":0.12209818,
        //     "CurrentLowestOfferPrice":43619.64,
        //     "CurrentHighestBidPrice":43153.58,
        //     "LastPrice":43378.43,
        //     "PrimaryCurrencyCode":"Xbt",
        //     "SecondaryCurrencyCode":"Usd",
        //     "CreatedTimestampUtc":"2022-01-14T22:52:29.5029223Z"
        // }
        return $this->parse_ticker($response, $market);
    }

    public function parse_order($order, $market = null) {
        //
        // fetchOrder
        //
        //     {
        //         "OrderGuid" => "c7347e4c-b865-4c94-8f74-d934d4b0b177",
        //         "CreatedTimestampUtc" => "2014-09-23T12:39:34.3817763Z",
        //         "Type" => "MarketBid",
        //         "VolumeOrdered" => 5.0,
        //         "VolumeFilled" => 5.0,
        //         "Price" => null,
        //         "AvgPrice" => 100.0,
        //         "ReservedAmount" => 0.0,
        //         "Status" => "Filled",
        //         "PrimaryCurrencyCode" => "Xbt",
        //         "SecondaryCurrencyCode" => "Usd"
        //     }
        //
        // fetchOpenOrders & fetchClosedOrders
        //
        //     {
        //         "OrderGuid" => "b8f7ad89-e4e4-4dfe-9ea3-514d38b5edb3",
        //         "CreatedTimestampUtc" => "2020-09-08T03:04:18.616367Z",
        //         "OrderType" => "LimitOffer",
        //         "Volume" => 0.0005,
        //         "Outstanding" => 0.0005,
        //         "Price" => 113885.83,
        //         "AvgPrice" => 113885.83,
        //         "Value" => 56.94,
        //         "Status" => "Open",
        //         "PrimaryCurrencyCode" => "Xbt",
        //         "SecondaryCurrencyCode" => "Usd",
        //         "FeePercent" => 0.005,
        //     }
        //
        $symbol = null;
        $baseId = $this->safe_string($order, 'PrimaryCurrencyCode');
        $quoteId = $this->safe_string($order, 'SecondaryCurrencyCode');
        $base = null;
        $quote = null;
        if (($baseId !== null) && ($quoteId !== null)) {
            $base = $this->safe_currency_code($baseId);
            $quote = $this->safe_currency_code($quoteId);
            $symbol = $base . '/' . $quote;
        } else if ($market !== null) {
            $symbol = $market['symbol'];
            $base = $market['base'];
            $quote = $market['quote'];
        }
        $orderType = $this->safe_string_2($order, 'Type', 'OrderType');
        $side = null;
        if (mb_strpos($orderType, 'Bid') !== false) {
            $side = 'buy';
        } else if (mb_strpos($orderType, 'Offer') !== false) {
            $side = 'sell';
        }
        if (mb_strpos($orderType, 'Market') !== false) {
            $orderType = 'market';
        } else if (mb_strpos($orderType, 'Limit') !== false) {
            $orderType = 'limit';
        }
        $timestamp = $this->parse8601($this->safe_string($order, 'CreatedTimestampUtc'));
        $amount = $this->safe_string_2($order, 'VolumeOrdered', 'Volume');
        $filled = $this->safe_string($order, 'VolumeFilled');
        $remaining = $this->safe_string($order, 'Outstanding');
        $feeRate = $this->safe_number($order, 'FeePercent');
        $feeCost = null;
        if ($feeRate !== null && $filled !== null) {
            $feeCost = $feeRate * $filled;
        }
        $fee = array(
            'rate' => $feeRate,
            'cost' => $feeCost,
            'currency' => $base,
        );
        $id = $this->safe_string($order, 'OrderGuid');
        $status = $this->parse_order_status($this->safe_string($order, 'Status'));
        $cost = $this->safe_string($order, 'Value');
        $average = $this->safe_string($order, 'AvgPrice');
        $price = $this->safe_string($order, 'Price');
        return $this->safe_order(array(
            'info' => $order,
            'id' => $id,
            'clientOrderId' => null,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601($timestamp),
            'lastTradeTimestamp' => null,
            'symbol' => $symbol,
            'type' => $orderType,
            'timeInForce' => null,
            'postOnly' => null,
            'side' => $side,
            'price' => $price,
            'stopPrice' => null,
            'cost' => $cost,
            'average' => $average,
            'amount' => $amount,
            'filled' => $filled,
            'remaining' => $remaining,
            'status' => $status,
            'fee' => $fee,
            'trades' => null,
        ), $market);
    }

    public function parse_order_status($status) {
        $statuses = array(
            'Open' => 'open',
            'PartiallyFilled' => 'open',
            'Filled' => 'closed',
            'PartiallyFilledAndCancelled' => 'canceled',
            'Cancelled' => 'canceled',
            'PartiallyFilledAndExpired' => 'canceled',
            'Expired' => 'canceled',
        );
        return $this->safe_string($statuses, $status, $status);
    }

    public function fetch_order($id, $symbol = null, $params = array ()) {
        yield $this->load_markets();
        $response = yield $this->privatePostGetOrderDetails (array_merge(array(
            'orderGuid' => $id,
        ), $params));
        $market = null;
        if ($symbol !== null) {
            $market = $this->market($symbol);
        }
        return $this->parse_order($response, $market);
    }

    public function fetch_open_orders($symbol = null, $since = null, $limit = null, $params = array ()) {
        yield $this->load_markets();
        $request = $this->ordered(array());
        $market = null;
        if ($symbol !== null) {
            $market = $this->market($symbol);
            $request['primaryCurrencyCode'] = $market['baseId'];
            $request['secondaryCurrencyCode'] = $market['quoteId'];
        }
        if ($limit === null) {
            $limit = 50;
        }
        $request['pageIndex'] = 1;
        $request['pageSize'] = $limit;
        $response = yield $this->privatePostGetOpenOrders (array_merge($request, $params));
        $data = $this->safe_value($response, 'Data', array());
        return $this->parse_orders($data, $market, $since, $limit);
    }

    public function fetch_closed_orders($symbol = null, $since = null, $limit = null, $params = array ()) {
        yield $this->load_markets();
        $request = $this->ordered(array());
        $market = null;
        if ($symbol !== null) {
            $market = $this->market($symbol);
            $request['primaryCurrencyCode'] = $market['baseId'];
            $request['secondaryCurrencyCode'] = $market['quoteId'];
        }
        if ($limit === null) {
            $limit = 50;
        }
        $request['pageIndex'] = 1;
        $request['pageSize'] = $limit;
        $response = yield $this->privatePostGetClosedOrders (array_merge($request, $params));
        $data = $this->safe_value($response, 'Data', array());
        return $this->parse_orders($data, $market, $since, $limit);
    }

    public function fetch_my_trades($symbol = null, $since = null, $limit = 50, $params = array ()) {
        yield $this->load_markets();
        $pageIndex = $this->safe_integer($params, 'pageIndex', 1);
        if ($limit === null) {
            $limit = 50;
        }
        $request = $this->ordered(array(
            'pageIndex' => $pageIndex,
            'pageSize' => $limit,
        ));
        $response = yield $this->privatePostGetTrades (array_merge($request, $params));
        $market = null;
        if ($symbol !== null) {
            $market = $this->market($symbol);
        }
        return $this->parse_trades($response['Data'], $market, $since, $limit);
    }

    public function parse_trade($trade, $market = null) {
        $timestamp = $this->parse8601($trade['TradeTimestampUtc']);
        $id = $this->safe_string($trade, 'TradeGuid');
        $orderId = $this->safe_string($trade, 'OrderGuid');
        $priceString = $this->safe_string_2($trade, 'Price', 'SecondaryCurrencyTradePrice');
        $amountString = $this->safe_string_2($trade, 'VolumeTraded', 'PrimaryCurrencyAmount');
        $price = $this->parse_number($priceString);
        $amount = $this->parse_number($amountString);
        $cost = $this->parse_number(Precise::string_mul($priceString, $amountString));
        $baseId = $this->safe_string($trade, 'PrimaryCurrencyCode');
        $quoteId = $this->safe_string($trade, 'SecondaryCurrencyCode');
        $marketId = null;
        if (($baseId !== null) && ($quoteId !== null)) {
            $marketId = $baseId . '/' . $quoteId;
        }
        $symbol = $this->safe_symbol($marketId, $market, '/');
        $side = $this->safe_string($trade, 'OrderType');
        if ($side !== null) {
            if (mb_strpos($side, 'Bid') !== false) {
                $side = 'buy';
            } else if (mb_strpos($side, 'Offer') !== false) {
                $side = 'sell';
            }
        }
        return array(
            'id' => $id,
            'info' => $trade,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601($timestamp),
            'symbol' => $symbol,
            'order' => $orderId,
            'type' => null,
            'side' => $side,
            'takerOrMaker' => null,
            'price' => $price,
            'amount' => $amount,
            'cost' => $cost,
            'fee' => null,
        );
    }

    public function fetch_trades($symbol, $since = null, $limit = null, $params = array ()) {
        /**
         * get the list of most recent trades for a particular $symbol
         * @param {str} $symbol unified $symbol of the $market to fetch trades for
         * @param {int|null} $since timestamp in ms of the earliest trade to fetch
         * @param {int|null} $limit the maximum amount of trades to fetch
         * @param {dict} $params extra parameters specific to the independentreserve api endpoint
         * @return {[dict]} a list of ~@link https://docs.ccxt.com/en/latest/manual.html?#public-trades trade structures~
         */
        yield $this->load_markets();
        $market = $this->market($symbol);
        $request = array(
            'primaryCurrencyCode' => $market['baseId'],
            'secondaryCurrencyCode' => $market['quoteId'],
            'numberOfRecentTradesToRetrieve' => 50, // max = 50
        );
        $response = yield $this->publicGetGetRecentTrades (array_merge($request, $params));
        return $this->parse_trades($response['Trades'], $market, $since, $limit);
    }

    public function fetch_trading_fees($params = array ()) {
        yield $this->load_markets();
        $response = yield $this->privatePostGetBrokerageFees ($params);
        //
        //     array(
        //         {
        //             "CurrencyCode" => "Xbt",
        //             "Fee" => 0.005
        //         }
        //         ...
        //     )
        //
        $fees = array();
        for ($i = 0; $i < count($response); $i++) {
            $fee = $response[$i];
            $currencyId = $this->safe_string($fee, 'CurrencyCode');
            $code = $this->safe_currency_code($currencyId);
            $tradingFee = $this->safe_number($fee, 'Fee');
            $fees[$code] = array(
                'info' => $fee,
                'fee' => $tradingFee,
            );
        }
        $result = array();
        for ($i = 0; $i < count($this->symbols); $i++) {
            $symbol = $this->symbols[$i];
            $market = $this->market($symbol);
            $fee = $this->safe_value($fees, $market['base'], array());
            $result[$symbol] = array(
                'info' => $this->safe_value($fee, 'info'),
                'symbol' => $symbol,
                'maker' => $this->safe_number($fee, 'fee'),
                'taker' => $this->safe_number($fee, 'fee'),
                'percentage' => true,
                'tierBased' => true,
            );
        }
        return $result;
    }

    public function create_order($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        yield $this->load_markets();
        $market = $this->market($symbol);
        $capitalizedOrderType = $this->capitalize($type);
        $method = 'privatePostPlace' . $capitalizedOrderType . 'Order';
        $orderType = $capitalizedOrderType;
        $orderType .= ($side === 'sell') ? 'Offer' : 'Bid';
        $request = $this->ordered(array(
            'primaryCurrencyCode' => $market['baseId'],
            'secondaryCurrencyCode' => $market['quoteId'],
            'orderType' => $orderType,
        ));
        if ($type === 'limit') {
            $request['price'] = $price;
        }
        $request['volume'] = $amount;
        $response = yield $this->$method (array_merge($request, $params));
        return array(
            'info' => $response,
            'id' => $response['OrderGuid'],
        );
    }

    public function cancel_order($id, $symbol = null, $params = array ()) {
        yield $this->load_markets();
        $request = array(
            'orderGuid' => $id,
        );
        return yield $this->privatePostCancelOrder (array_merge($request, $params));
    }

    public function sign($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'][$api] . '/' . $path;
        if ($api === 'public') {
            if ($params) {
                $url .= '?' . $this->urlencode($params);
            }
        } else {
            $this->check_required_credentials();
            $nonce = $this->nonce();
            $auth = array(
                $url,
                'apiKey=' . $this->apiKey,
                'nonce=' . (string) $nonce,
            );
            $keys = is_array($params) ? array_keys($params) : array();
            for ($i = 0; $i < count($keys); $i++) {
                $key = $keys[$i];
                $value = (string) $params[$key];
                $auth[] = $key . '=' . $value;
            }
            $message = implode(',', $auth);
            $signature = $this->hmac($this->encode($message), $this->encode($this->secret));
            $query = $this->ordered(array());
            $query['apiKey'] = $this->apiKey;
            $query['nonce'] = $nonce;
            $query['signature'] = strtoupper($signature);
            for ($i = 0; $i < count($keys); $i++) {
                $key = $keys[$i];
                $query[$key] = $params[$key];
            }
            $body = $this->json($query);
            $headers = array( 'Content-Type' => 'application/json' );
        }
        return array( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }
}
