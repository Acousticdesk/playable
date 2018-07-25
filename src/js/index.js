import '../styles/styles.css';
import PlayableAdMediator from './Mediator';

window.addEventListener('load', () => {
	window.setTimeout(() => new PlayableAdMediator(), 1000);
});
