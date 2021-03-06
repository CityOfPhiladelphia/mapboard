
import * as faComps from '@phila/vue-comps/src/fa.js';
import * as faMapping from '@phila/vue-mapping/src/fa.js';

// Font Awesome Icons
import { library } from '@fortawesome/fontawesome-svg-core';
import { faSpinner } from '@fortawesome/free-solid-svg-icons/faSpinner';
import { faBook } from '@fortawesome/free-solid-svg-icons/faBook';
import { faWrench } from '@fortawesome/free-solid-svg-icons/faWrench';
import { faUniversity } from '@fortawesome/free-solid-svg-icons/faUniversity';
import { faGavel } from '@fortawesome/free-solid-svg-icons/faGavel';
import { faGlobe } from '@fortawesome/free-solid-svg-icons/faGlobe';
library.add(faSpinner, faBook, faWrench, faUniversity, faGavel, faGlobe);

export default library;
