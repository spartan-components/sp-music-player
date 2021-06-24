import { html, css, LitElement } from 'lit-element';

export class SpMusicPlayer extends LitElement {
  static get styles() {
    return css`
      :host {
        --primary-color: #fff;
        --secondary-color: #000;
        color: var(--primary-color);
        counter-reset: tracks;
        display: block;
      }
      ol {
        padding: 0;
      }
      ol li {
        counter-increment: tracks;
        list-style: none;
      }
      ol li button {
        background: transparent;
        border: none;
        color: inherit;
        font: inherit;
        display: inline-block;
        padding: 0.75rem 1.25rem;
        transition: box-shadow 200ms ease;
        text-align: left;
        width: 100%;
      }
      ol li button.active {
        background: var(--primary-color);
        color: var(--secondary-color);
        box-shadow: 0 0 0 2px var(--primary-color) inset;
      }
      ol li button::before {
        content: counter(tracks) ". ";
      }
      .controls {
        display: flex;
        flex-wrap: wrap;
        margin: -0.75rem;
      }
      .controls > * {
        margin: 0.75rem;
      }
      .controls input {
        flex-grow: 7777;
      }
      .buttons {
        display: flex;
        flex-grow: 1;
      }
      .buttons button {
        align-items: center;
        background: none;
        border: none;
        display: flex;
        flex-grow: 1;
        justify-content: center;
        margin: 0;
        padding: 0.5rem;
        transition: box-shadow 200ms ease;
      }

      svg {
        color: var(--primary-color)
      }

      input[type=range] {
        background-color: transparent;
        -webkit-appearance: none;
      }
      input[type=range]:focus {
        outline: none;
      }
      input[type=range]::-webkit-slider-runnable-track {
        background: var(--primary-color);
        border: none;
        border-radius: 8px;
        cursor: pointer;
        height: 8px;
        width: 100%;
      }
      input[type=range]::-webkit-slider-thumb {
        -webkit-appearance: none;
        background: var(--secondary-color);
        border: 2px solid var(--primary-color);
        border-radius: 16px;
        cursor: pointer;
        height: 16px;
        margin-top: -4px;
        transition: background 200ms ease;
        width: 16px;
      }
      input[type=range]:focus::-webkit-slider-thumb {
        background: var(--primary-color);
      }
      input[type=range]::-moz-range-track {
        background: var(--primary-color);
        border: none;
        border-radius: 8px;
        cursor: pointer;
        height: 8px;
        width: 100%;
      }
      input[type=range]::-moz-range-thumb {
        background: var(--secondary-color);
        border: 2px solid var(--primary-color);
        border-radius: 16px;
        cursor: pointer;
        height: 16px;
        transition: background 200ms ease;
        width: 16px;
      }
      input[type=range]:focus::-moz-range-thumb {
        background: var(--primary-color);
      }
      input[type=range]::-ms-track {
        background: transparent;
        border-color: transparent;
        border-width: 4px 0;
        color: transparent;
        cursor: pointer;
        height: 8px;
        width: 100%;
      }
      input[type=range]::-ms-fill-lower {
        background: var(--primary-color);
        border: none;
        border-radius: 16px;
      }
      input[type=range]::-ms-fill-upper {
        background: var(--primary-color);
        border: none;
        border-radius: 16px;
      }
      input[type=range]::-ms-thumb {
        background: var(--secondary-color);
        border: 2px solid var(--primary-color);
        border-radius: 16px;
        cursor: pointer;
        height: 16px;
        margin-top: 0px;
        transition: background 200ms ease;
        width: 16px;
      }
      input[type=range]:focus::-ms-thumb {
        background-color: var(--primary-color);
      }
      /*input[type=range]:focus::-ms-fill-lower {
        background: var(--primary-color);
      }
      input[type=range]:focus::-ms-fill-upper {
        background: var(--primary-color);
      }*/
      /*TODO: Use one of the selectors from https://stackoverflow.com/a/20541859/7077589 and figure out
      how to remove the virtical space around the range input in IE*/
      @supports (-ms-ime-align: auto) {
        /* Pre-Chromium Edge only styles, selector taken from hhttps://stackoverflow.com/a/32202953/7077589 */
        input[type=range] {
          margin: 0;
          /*Edge starts the margin from the thumb, not the track as other browsers do*/
        }
      }

      @supports (box-shadow: 0px 0px 0px 2px inset) {
        :host .buttons button:focus {
          box-shadow: 0px 0px 0px 3px var(--primary-color) inset;
          outline: none;
        }
        :host li button:focus {
          box-shadow: 0px 0px 0px 3px var(--primary-color) inset;
          outline: none;
        }
      }
    `;
  }

  static get properties() {
    return {
      album: { type: String },
      artist: { type: String },
      currentTrackIndex: { type: Number},
      currentTrack: { type: Node },
      currentTime: { type: Number },
      tracks: { type: Array },
    };
  }

  __initializeTracks() {
    // get all the tracks from the DOM
    const tracks = Array.from(this.querySelectorAll('li'));
    // modify each item in the above created Array
    this.tracks = tracks.map((track, index) => {
      // get the audio element
      const audio = track.querySelector('audio');
      // get common text elements for title
      const title = track.querySelector('h1,h2,h3,h4,h5,h6,p');
      return {
        index,
        audioNode: audio,
        title: title.textContent
      }
    });
  }

  __playbackController(nextTrackParam) {
    const prevTrack = this.currentTrackIndex;
    const nextTrack = (nextTrackParam + this.tracks.length) % this.tracks.length;
    // scenarios:
    // - clicked track is the current track --> toggle playback
    // - clicked track is not the current track --> pause current, start new

    if (prevTrack === nextTrack) {
      this.currentTrack.paused ? this.__playTrack(nextTrack) : this.__pauseTrack(nextTrack);
    } else {
      this.__pauseTrack(prevTrack);
      this.__playTrack(nextTrack);
    }
  }

  __updateTime(index, e) {
    if (e === undefined) {
      this.currentTime = this.currentTrack.currentTime;
    } else {
      this.currentTime = e.target.value;
      this.currentTrack.currentTime = e.target.value;
    }
  }

  __playTrack(index) {
    // set currentTrack audioNode shorthand property
    this.currentTrack = this.tracks[index].audioNode;
    // set the index of the current track
    this.currentTrackIndex = index;
    // start playback
    this.currentTrack.play();
    // subscribe to the current time
    this.currentTrack.addEventListener('timeupdate', () => this.__updateTime(index));
  }

  __pauseTrack(index) {
    // pause the selected track
    this.tracks[index].audioNode.pause();
    // remove event listener
    this.tracks[index].audioNode.addEventListener('timeupdate', () => this.__updateTime(index));
  }

  connectedCallback() {
    super.connectedCallback();
    this.currentTime = 0;
    this.__initializeTracks();
    this.currentTrack = this.tracks[0].audioNode;
    this.currentTrackIndex = 0;
  }

  prevButton() {
    return html`${ this.tracks.length > 1
    ? html`
      <button @click=${() => this.__playbackController(this.currentTrackIndex - 1)}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-skip-back"><polygon points="19 20 9 12 19 4 19 20"></polygon><line x1="5" y1="19" x2="5" y2="5"></line></svg>
      </button>`
    : '' }`
  }

  playButton() {
    return html`
    <button @click=${() => this.__playbackController(this.currentTrackIndex)}>
      ${ this.currentTrack.paused
        ? html`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-play"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`
        : html`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-pause"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>`
      }
    </button>`;
  }

  nextButton() {
    return html`${ this.tracks.length > 1
    ? html`
      <button @click=${() => this.__playbackController(this.currentTrackIndex + 1)}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-skip-forward"><polygon points="5 4 15 12 5 20 5 4"></polygon><line x1="19" y1="5" x2="19" y2="19"></line></svg>
      </button>`
    : '' }`;
  }

  buttonsTemplate() {
    return html`
      ${this.prevButton()}
      ${this.playButton()}
      ${this.nextButton()}
    `;
  }

  render() {
    return html`
      <ol>
        ${this.tracks.map(track => html`
        <li>
          <button
            class=${track.index === this.currentTrackIndex ? 'active' : ''}
            @click=${() => this.__playbackController(track.index)}
          >
            ${track.title}
          </button>
        </li>
        `)}
      </ol>
      <div class="controls">
        <div class="buttons">
          ${this.buttonsTemplate()}
        </div>
        <input type="range" min="0" max=${this.currentTrack.duration} .value=${this.currentTime} @change=${(e) => this.__updateTime(this.currentTrackIndex, e)} />
      </div>
    `;
  }
}
