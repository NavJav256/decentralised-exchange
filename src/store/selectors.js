import { createSelector } from 'reselect'

import { get, groupBy, maxBy, minBy, reject } from 'lodash'

import moment from 'moment'
import { ethers } from 'ethers'

const GREEN = '#25CE8F'
const RED = '#F45353'

const tokens = state => get(state, 'tokens.contracts')

const allOrders = state => get(state, 'exchange.allOrders.data', [])
const cancelledOrders = state => get(state, 'exchange.cancelledOrders.data', [])
const filledOrders = state => get(state, 'exchange.filledOrders.data', [])

const openOrders = state => {
    const all = allOrders(state)
    const cancelled = cancelledOrders(state)
    const filled = filledOrders(state)

    const openOrders = reject(all, (order) => {
        const orderFilled = filled.some((o) => o._id.toString() === order._id.toString())
        const orderCancelled = cancelled.some((o) => o._id.toString() === order._id.toString())
        return (orderFilled || orderCancelled)
    })
    return openOrders
}

const decorateOrder = (order, tokens) => {

    let token0Amount, token1Amount

    if(order._tokenGive === tokens[1].address) {
        token0Amount = order._amountGive
        token1Amount = order._amountGet
    } else {
        token0Amount = order._amountGet
        token1Amount = order._amountGive
    }

    const precision = 100000
    let tokenPrice = (token1Amount / token0Amount )
    tokenPrice = Math.round(tokenPrice * precision) / precision

    return ({
        ...order,
        token0Amount: ethers.utils.formatEther(token0Amount),
        token1Amount: ethers.utils.formatEther(token1Amount),
        tokenPrice,
        formattedTimestamp: moment.unix(order._timestamp).format('h:m:ssa d MMM D') 
    })
}

const decorateOrderBookOrder = (order, tokens) => {
    const orderType = order._tokenGive === tokens[1].address ? 'buy' : 'sell'
    return ({
        ...order,
        orderType,
        orderTypeClass: (orderType === 'buy' ? GREEN : RED),
        orderFillAction: (orderType === 'buy' ? 'sell' : 'buy')
    })
}

const decorateOrderBookOrders = (orders, tokens) => {
    return (
        orders.map((order) => {
            order = decorateOrder(order, tokens)
            order = decorateOrderBookOrder(order, tokens)
            return(order)
        })
    )
}

export const orderBookSelector = createSelector(openOrders, tokens, (orders, tokens) => {

    if(!tokens[0] || !tokens[1]) return

    orders = orders.filter((o) => o._tokenGet === tokens[0].address || o._tokenGet === tokens[1].address)
    orders = orders.filter((o) => o._tokenGive === tokens[0].address || o._tokenGive === tokens[1].address)

    orders = decorateOrderBookOrders(orders, tokens)

    orders = groupBy(orders, 'orderType')

    const buyOrders = get(orders, 'buy', [])
    orders = {
        ...orders,
        buyOrders: buyOrders.sort((a,b) => b.tokenPrice - a.tokenPrice)
    }

    const sellOrders = get(orders, 'sell', [])
    orders = {
        ...orders,
        sellOrders: sellOrders.sort((a,b) => b.tokenPrice - a.tokenPrice)
    }
    return orders
})

const buildGraphData = (orders) => {
    orders = groupBy(orders, (o) => moment.unix(o._timestamp).startOf('hour').format())

    const hours = Object.keys(orders)
    const graphData = hours.map((hour) => {

        const group = orders[hour]
        const open = group[0]
        const high = maxBy(group, 'tokenPrice')
        const low = minBy(group, 'tokenPrice')
        const close = group[group.length - 1] 

         return({
            x: new Date(hour),
            y: [open.tokenPrice, high.tokenPrice, low.tokenPrice, close.tokenPrice]
         })
    })
    return graphData 
}

export const priceChartSelector = createSelector(filledOrders, tokens, (orders, tokens) => {

    if(!tokens[0] || !tokens[1]) return 

    orders = orders.filter((o) => o._tokenGet === tokens[0].address || o._tokenGet === tokens[1].address)
    orders = orders.filter((o) => o._tokenGive === tokens[0].address || o._tokenGive === tokens[1].address)
    
    orders = orders.sort((a,b) => a._timestamp - b._timestamp)
    orders = orders.map((o) => decorateOrder(o, tokens))

    let penultimate, ultimate
    [penultimate, ultimate] = orders.slice(orders.length - 2, orders.length)
     
    const penultimatePrice = get(penultimate, 'tokenPrice', 0)
    const ultimatePrice = get(ultimate, 'tokenPrice', 0)

    return({
        ultimatePrice,
        priceChange: ultimatePrice >= penultimatePrice ? '+' : '-', 
        series: [{
            data: buildGraphData(orders)
        }]
    })
})
