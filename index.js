const { Plugin } = require('powercord/entities')
const { findInReactTree, getOwnerInstance, waitFor } = require('powercord/util')
const { getModule, FluxDispatcher, React } = require('powercord/webpack')
const { inject, uninject } = require('powercord/injector')
const { Icon } = require("powercord/components")
const { selectVoiceChannel } = getModule(["selectVoiceChannel"], false)


module.exports = class RejoinVC extends Plugin {
    async startPlugin() {
        this.PutButton = this.PutButton.bind(this);
        
        
        FluxDispatcher.subscribe("VOICE_CHANNEL_SELECT", this.PutButton)
        // inject('rejoin-vc', Account.__proto__, 'render', (_, res) => {
        //    const r = findInReactTree(res, e => e?.props?.basis && e.props.children && e.props.shrink)
        //    if (!r) return res

        //    r.props.children.unshift(React.createElement(r.props.children[0].type, {
        //        icon: () => React.createElement(Icon, { name: 'CallJoin' }),
        //        onClick: () => {
        //        },
        //        tooltipText: `Rejoin VC`
        //    }))

        //    return res
        // })
        // Account.forceUpdate()
    }

    pluginWillUnload() {
        uninject('rejoin-vc')
        FluxDispatcher.unsubscribe("VOICE_CHANNEL_SELECT", this.PutButton)
    }

    async PutButton (voice)  {
        const classes = await getModule(['container', 'usernameContainer'])
        let container = await waitFor('.' + classes.container)
        if (container.parentElement.className.includes('powercord-spotify'))
            container = Array.from(document.querySelectorAll('.' + classes.container)).pop()
        const Account = getOwnerInstance(container)
        if(voice.currentVoiceChannelId !== null) {
            uninject('rejoin-vc')
            inject('rejoin-vc', Account.__proto__, 'render', (_, res) => {
                const r = findInReactTree(res, e => e?.props?.basis && e.props.children && e.props.shrink)
                if (!r) return res
    
                r.props.children.unshift(React.createElement(r.props.children[0].type, {
                    icon: () => React.createElement(Icon, { name: 'CallJoin' }),
                    onClick: () => {
                        uninject('rejoin-vc')
                        selectVoiceChannel(voice.currentVoiceChannelId)
                    },
                    tooltipText: `Rejoin VC`
                }))
                return res
            })
            setTimeout(() => {
                uninject('rejoin-vc')
            }, 5000)
        }
    }
}