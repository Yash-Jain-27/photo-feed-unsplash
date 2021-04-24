import './App.css';
import React from 'react';
import { createApi } from "unsplash-js";
import env from './env';
import {
    CellMeasurer,
    CellMeasurerCache,
    createMasonryCellPositioner,
    Masonry,
} from 'react-virtualized';
import ImageMeasurer from "react-virtualized-image-measurer";

const unsplash = createApi({ accessKey: env.access_key });

const columnWidth = 200;
const defaultHeight = 250;
const defaultWidth = columnWidth;

const cache = new CellMeasurerCache({
    defaultHeight,
    defaultWidth,
    fixedWidth: true
});

const cellPositionerConfig = {
    cellMeasurerCache: cache,
    columnCount: 3,
    columnWidth,
    spacer: 10
};

const cellPositioner = createMasonryCellPositioner(cellPositionerConfig);

const MasonryComponent = ({ itemsWithSizes, setRef }) => {
    const cellRenderer = ({ index, key, parent, style }) => {
        const { item, size } = itemsWithSizes[index];
        const height = columnWidth * (size.height / size.width) || defaultHeight;

        return (
            <CellMeasurer cache={cache} index={index} key={key} parent={parent}>
                <div style={style}>
                    <img
                        src={item.urls.full}
                        alt={item.alt_description}
                        style={{
                            height: height,
                            width: columnWidth,
                            display: "block"
                        }}
                    />
                </div>
            </CellMeasurer>
        );
    };

    return (
        <Masonry
            cellCount={itemsWithSizes.length}
            cellMeasurerCache={cache}
            cellPositioner={cellPositioner}
            cellRenderer={cellRenderer}
            height={600}
            width={800}
            ref={setRef}
        />
    );
};
class App extends React.Component {
    masonryRef = null;

    constructor(props) {
        super(props);
        this.state = {
            images: [],
            page: 0,
            loading: false,
            prevY: 0
        };

        this.renderImages = this.renderImages.bind(this)
    }

    componentDidMount() {
        this.getImages(this.state.page);

        var options = {
            root: null,
            rootMargin: "0px",
            threshold: 1.0
        };

        this.observer = new IntersectionObserver(
            this.handleObserver.bind(this),
            options
        );

        this.observer.observe(this.loadingRef);
    }

    handleObserver(entities, observer) {
        const y = entities[0].boundingClientRect.y;
        if (this.state.prevY > y) {
            this.getImages(this.state.page++);
            this.setState({ page: this.state.page++ });
        }
        this.setState({ prevY: y });
    }

    getImages(page) {
        this.setState({ loading: true });
        unsplash.photos.list({ page })
            .then(res => {
                this.setState({ images: [...this.state.images, ...res.response.results] });
                this.setState({ loading: false });
            });
    }

    renderImages() {
        const { images } = this.state
        return images.map((pic, index) =>
            <div className="card" key={`${pic.id}-${index}`}>
                <img
                    className="card--image"
                    alt={pic.alt_description}
                    src={pic.urls.full}
                    width="50%"
                    height="50%"
                ></img>
            </div>)
    }

    setMasonry = node => (this.masonryRef = node);

    render() {
        const { images } = this.state
        const loadingCSS = {
            height: "100px",
            margin: "30px"
        };

        const loadingTextCSS = { display: this.state.loading ? "block" : "none" };

        return (
            <div className="App">
                <div className="container">
                    <h1 className="title">React Photo Search</h1>
                    <div className="card-list">
                        <ImageMeasurer
                            items={images}
                            image={item => item.urls.full}
                            defaultHeight={defaultHeight}
                            defaultWidth={defaultWidth}
                        >
                            {({ itemsWithSizes }) => <MasonryComponent setRef={this.setMasonry} itemsWithSizes={itemsWithSizes} />}
                        </ImageMeasurer>
                    </div>
                    <div
                        ref={loadingRef => (this.loadingRef = loadingRef)}
                        style={loadingCSS}
                    >
                        <span style={loadingTextCSS}>Loading...</span>
                    </div>
                </div>
            </div>
        );
    }
}
export default App;
