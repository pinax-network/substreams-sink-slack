# [`Substreams`](https://substreams.streamingfast.io/) [Slack](https://slack.com/) CLI `Node.js`

<!-- [<img alt="github" src="" height="20">](https://github.com/pinax-network/substreams-sink-slack) -->
<!-- [<img alt="npm" src="" height="20">](https://www.npmjs.com/package/substreams-sink-slack) -->
<!-- [<img alt="GitHub Workflow Status" src="" height="20">](https://github.com/pinax-network/substreams-sink-slack/actions?query=branch%3Amain) -->

> `substreams-sink-slack` is a tool that allows developers to pipe data extracted from a blockchain to the Slack messaging social platform.

## 📖 Documentation

<!-- ### https://www.npmjs.com/package/substreams-sink-slack -->

### Further resources

- [**Substreams** documentation](https://substreams.streamingfast.io)
- [**Slack** API documentation](https://api.slack.com/automation)

### Protobuf

- [`sf.substreams.entity.v1.EntityChanges`](https://github.com/streamingfast/substreams-entity-change/blob/develop/proto/entity/v1/entity.proto)

## CLI
[**Use pre-built binaries**](https://github.com/pinax-network/substreams-sink-slack/releases)
- [x] MacOS
- [x] Linux
- [x] Windows

**Install** globally via npm
```
$ npm install -g substreams-sink-slack
```

**Run**
```
$ substreams-sink-slack run [options] <spkg>
```

### Formatting
Supports `JSON` and `YAML` format for configuration file. Example of `config.json` format configuration file:

```json
[
    {
        "entity": "Transfer",
        "chat_ids": [
            "U0G9QF9C6"
        ],
        "message": "This **{user_id}** made a __transaction__ with id `{trx_id}`"
    },
    {
        "entity": "Grants",
        "chat": [
            "U0G9QF9C6"
        ],
        "message": "This `{grant}`"
    }
]
```

Text between `{}` are field names and are used as labels for message templating. In the example above, all `EntityChanges` messages coming from the substream with `entity` key having `Transfer` as value, will be sent to [Slack](https://slack.com/) channel or user with id `U0G9QF9C6`, as specified in the first json object.

## Features

### Substreams

- Consume `*.spkg` from:
  - [x] Load URL or IPFS
  - [ ] Read from `*.spkg` local filesystem
  - [ ] Read from `substreams.yaml` local filesystem
- [x] Handle `cursor` restart

### Slack
- [x] Handle rate limit
- [x] Markdown message parsing