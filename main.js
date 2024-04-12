import promptSync from 'prompt-sync'

const prompt = promptSync({ sigint: true })
let input
const orderBook = {
    base: "UAH",
    quote: "USD",
    sell: [],
    buy: [],
    add: function (order) {
        const list = order.side ? this.buy : this.sell
        const sort = order.side ? 'DESC' : 'ASC'
        let lastI = 0

        switch (sort) {
            case 'DESC':
                list.some((item, i) => {
                    if (item.price >= order.price) lastI = i + 1
                    else return true
                })
                break
            case 'ASC':
                list.some((item, i) => {
                    if (item.price < order.price) lastI = i + 1
                    else return true
                })
                break
        }
        list.splice(lastI, 0, order)
        return this.match(order.side)
    },
    match: function (side) {
        if (this.sell.length === 0 || this.buy.length === 0) return 0
        if (this.sell[0].user_id === this.buy[0].user_id) return 0
        if (this.sell[0].price <= this.buy[0].price) {
            const order = side ? this.buy[0] : this.sell[0]
            const minus = side ? '' : '-'
            const user_id = order.user_id
            const value = order.price * order.amount
            const balanceChange = `${user_id} ${minus}${value} ${this.base}`

            this.sell.splice(this.sell.indexOf(this.sell[0]), 1)
            this.buy.splice(this.buy.indexOf(this.buy[0]), 1)
            return balanceChange
        }
        return 0
    }
}

while (true) {
    console.log('\nuser_id amount price side')
    input = prompt()
    if (input == 0) break

    const raw = input.split(' ')
    if (raw.length < 4 || isNaN(+raw[1]) || isNaN(+raw[2]) || isNaN(+raw[3])) {
        console.log('Invalid value')
        continue
    }

    const output = orderBook.add({
        user_id: raw[0],
        amount: +raw[1],
        price: +raw[2],
        side: +raw[3],
    })

    console.log('\nuser_id value currency')
    console.log(output)
}