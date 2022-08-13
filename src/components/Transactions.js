import { useRef, useState } from 'react'
import { useSelector } from 'react-redux'

import sort from '../assets/sort.svg'

import { myFilledOrdersSelector, myOpenOrdersSelector } from '../store/selectors'

import Banner from './Banner'

const Transactions = () => {

    const [showOrders, setShowOrders] = useState(true)

    const symbols = useSelector(state => state.tokens.symbols)

    const myOrders = useSelector(myOpenOrdersSelector)
    const myTrades = useSelector(myFilledOrdersSelector)

    const orderRef = useRef(null)
    const tradeRef = useRef(null)

    const tabHandler = (e) => {
        if(e.target.className !== orderRef.current.className) {
            e.target.className = 'tab tab--active'
            orderRef.current.className = 'tab'
            setShowOrders(false)
        } else {
            e.target.className = 'tab tab--active'
            tradeRef.current.className = 'tab'
            setShowOrders(true)
        }
    }

    return (
        <div className="component exchange__transactions">
            {showOrders ? (
                <div>
                    <div className='component__header flex-between'>
                        <h2>My Orders</h2>

                        <div className='tabs'>
                            <button onClick={tabHandler} ref={orderRef} className='tab tab--active'>Orders</button>
                            <button onClick={tabHandler} ref={tradeRef} className='tab'>Trades</button>
                        </div>
                    </div>
                    {!myOrders || myOrders.length === 0 ? (
                        <Banner text='No Open Orders' />
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>{symbols && symbols[0]} <img src={sort} alt='sort' /></th>
                                    <th>{symbols && `${symbols[0]}/${symbols[1]}`} <img src={sort} alt='sort' /></th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {myOrders && myOrders.map((order, index) => {
                                    return (
                                        <tr key={index}>
                                            <td style={{ color: `${order.orderTypeClass}` }}>{order.token0Amount}</td>
                                            <td>{order.tokenPrice}</td>
                                            <td></td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            ) : (
                <div>
                    <div className='component__header flex-between'>
                        <h2>My Transactions</h2>

                            <div className='tabs'>
                                <button onClick={tabHandler} ref={orderRef} className='tab tab--active'>Orders</button>
                                <button onClick={tabHandler} ref={tradeRef} className='tab'>Trades</button>
                            </div>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th>Time <img src={sort} alt='sort' /></th>
                                <th>{symbols && symbols[0]} <img src={sort} alt='sort' /></th>
                                <th>{symbols && `${symbols[0]}/${symbols[1]}`} <img src={sort} alt='sort' /></th>
                            </tr>
                        </thead>
                        <tbody>
                        {myTrades && myTrades.map((order, index) => {
                            return (
                                <tr key={index}>
                                    <td>{order.formattedTimestamp}</td>
                                    <td style={{ color: `${order.orderClass}` }}>{order.orderSign}{order.token0Amount}</td>
                                    <td>{order.tokenPrice}</td>
                                </tr>
                            )
                        })}
                    </tbody>
                    </table>

                </div>
            )}
        </div>
    )
}

export default Transactions
