# react-text-range

![cast2](https://github.com/yetanothervan/react-text-range/assets/5338279/f5977266-4de9-412f-8f8c-e7639e8d6bc8)

## using

```js
// ...
import { TextContainer, RangeState, ReactTextRange } from "./ReactTextRange";

const MyTextContainer: TextContainer = React.forwardRef(({ children }, ref) =>
    <div ref={ref} className="text-2xl text-gray-300 w-80 bg-yellow-100 select-none p-5 whitespace-pre-wrap">
        {children}
    </div>
);

const App: FunctionComponent = () => {
    const [myPos, setMyPos] = useState<RangeState>({ left: 23, right: 37 })
    return (
        <div style={{ margin: 20 }}>
            <ReactTextRange initLeftPos={23} initRightPos={47}
                Container={MyTextContainer} onChange={setMyPos}
                handlerWidth={18}
                selectionClass='bg-yellow-300 text-black'>{
                    `Some text
or even some real good multiline text
here and there`}
            </ReactTextRange>
            <div>
                <span>{myPos?.left}</span>
                &nbsp;
                <span>{myPos?.right}</span>
            </div>
        </div>
    )
}
```

You can set selectionClass, headClass, tailClass, leftHandlerClass and RightHandlerClass in ReactTextRange
