export function onOpen() {
  const menu = DocumentApp.getUi()
    .createAddonMenu()
    .addItem('Start', 'openSidebar')
    .addSeparator()
    .addItem('New diagram', 'openCreateDiagramDialog')
    .addItem('Browse diagrams', 'openSelectDiagramDialog')
    .addItem('Edit selected diagram', 'openEditDiagramDialog')
    .addSeparator()
    .addItem('About', 'openAboutDialog')
    .addItem('Help', 'openHelpDialog');

  menu.addToUi();
}

export function setBaseUrl(url) {
  try {
    const scriptProperties = PropertiesService.getScriptProperties();
    scriptProperties.setProperty('baseURL', url);
  } catch (err) {
    Logger.log('Failed with error %s', err.message);
  }
}

function getBaseUrl() {
  try {
    const scriptProperties = PropertiesService.getScriptProperties();
    const baseURL = scriptProperties.getProperty('baseURL');
    Logger.log('Base URL: %s', baseURL);
    return baseURL;
  } catch (error) {
    Logger.log('Failed with error %s', error.message);
  }
}

export function openCreateDiagramDialog() {
  const html = HtmlService.createHtmlOutputFromFile('create-diagram-dialog')
    .append(
      `<script>
      window.addEventListener('message', function(event) {
        if (event.data === "closeDialog") {
            google.script.host.close();
        }
      }, false);
    </script>`
    )
    .setWidth(1366)
    .setHeight(768);
  DocumentApp.getUi().showModalDialog(html, 'Create new diagram');
}

export function openEditDiagramDialog() {
  const doc = DocumentApp.getActiveDocument();
  const selection = doc.getSelection();

  if (!selection) {
    DocumentApp.getUi().alert('No diagram selected. Please select a diagram.');
    return;
  }

  const html = HtmlService.createHtmlOutputFromFile('edit-diagram-dialog')
    .append(
      `<script>
      window.addEventListener('message', function(event) {
        if (event.data === "closeDialog") {
            google.script.host.close();
        }
      }, false);
    </script>`
    )
    .setWidth(1366)
    .setHeight(768);

  DocumentApp.getUi().showModalDialog(html, 'Edit diagram');
}

export function openPreviewDiagramDialog() {
  const html = HtmlService.createHtmlOutputFromFile('preview-diagram-dialog')
    .append(
      `<script>
      window.addEventListener('message', function(event) {
        if (event.data === "closeDialog") {
            google.script.host.close();
        }
      }, false);
    </script>`
    )
    .setWidth(1366)
    .setHeight(768);

  DocumentApp.getUi().showModalDialog(html, 'Preview diagram');
}

export function openEditDiagramDialogWithUrl() {
  const html = HtmlService.createHtmlOutputFromFile('edit-diagram-dialog')
    .append(
      `<script>
      window.addEventListener('message', function(event) {
        if (event.data === "closeDialog") {
            google.script.host.close();
        }
      }, false);
    </script>`
    )
    .setWidth(1366)
    .setHeight(768);

  DocumentApp.getUi().showModalDialog(html, 'Edit diagram');
}

export function openSelectDiagramDialog() {
  const html = HtmlService.createHtmlOutputFromFile('select-diagram-dialog')
    .append(
      `<script>
      window.addEventListener('message', function(event) {
        if (event.data === "closeDialog") {
            google.script.host.close();
        }
      }, false);
    </script>`
    )
    .setWidth(1366)
    .setHeight(768);
  DocumentApp.getUi().showModalDialog(html, 'Select diagram');
}

export function openAboutDialog() {
  var ui = DocumentApp.getUi();

  var text = `Mermaid Chart is building the next generation of smart diagramming for enterprise teams. Easily create and collaborate on self-designing diagrams using markdown style text and the Mermaid Visual Editor.
Skip the rough draft of your diagrams using Mermaid AI and share your professional diagrams easily with colleagues. Say goodbye to boring documentation and hello to Mermaid Chart!`;

  ui.alert('About', text, ui.ButtonSet.OK);
}

export function openHelpDialog() {
  var ui = DocumentApp.getUi();

  var text = `Link your Mermaid Chart account to Google Docs and create, insert, or edit your Mermaid Chart diagrams directly in Google Docs to get started. If you have questions about how to use Mermaid Chart, please review the documentation on our website or our YouTube channel. Please contact hello@mermaidchart.com for further customer support`;

  ui.alert('Help', text, ui.ButtonSet.OK);
}

export function openSidebar() {
  const html =
    HtmlService.createHtmlOutputFromFile('sidebar').setTitle('Mermaid Chart');
  DocumentApp.getUi().showSidebar(html);
}

export function handleCallback(callbackRequest) {
  var service = getOAuthService();
  var authorized = service.handleCallback(callbackRequest);
  if (authorized) {
    return HtmlService.createHtmlOutput(
      '<html><body>Success! You can close this window.<script>window.setTimeout(function() { google.script.host.close(); }, 1000);</script></body></html>'
    );
  } else {
    return HtmlService.createHtmlOutput(
      '<html><body>Denied. You can close this window.<script>window.setTimeout(function() { google.script.host.close(); }, 1000);</script></body></html>'
    );
  }
}

function getOAuthService() {
  pkceChallengeVerifier();
  const userProps = PropertiesService.getUserProperties();
  const baseURL = getBaseUrl();

  if (!baseURL) {
    throw new Error('Base URL is not defined.');
  }

  return OAuth2.createService('Mermaid Chart')
    .setAuthorizationBaseUrl(baseURL + '/oauth/authorize')
    .setTokenUrl(baseURL + '/oauth/token')
    .setClientId('f88f1365-dea8-466e-8880-e22211e145bd')
    .setScope('email')
    .setCallbackFunction('handleCallback')
    .setCache(CacheService.getUserCache())
    .setPropertyStore(PropertiesService.getUserProperties())
    .setTokenPayloadHandler((payload) => {
      payload['code_verifier'] = userProps.getProperty('code_verifier');
      return payload;
    })
    .setParam('response_type', 'code')
    .setParam('code_challenge_method', 'S256')
    .setParam('code_challenge', userProps.getProperty('code_challenge') ?? '');
}

export function getOAuthURL() {
  var service = getOAuthService();
  return service.getAuthorizationUrl();
}

export function getAuthorizationState() {
  const service = getOAuthService();

  if (service.hasAccess()) {
    return {
      authorized: true,
      token: service.getAccessToken(),
    };
  }
  return {
    authorized: false,
  };
}

export function resetOAuth() {
  getOAuthService().reset();
  PropertiesService.getUserProperties()
    .deleteProperty('code_challenge')
    .deleteProperty('code_verifier');
}

function pkceChallengeVerifier() {
  const userProps = PropertiesService.getUserProperties();
  if (!userProps.getProperty('code_verifier')) {
    let verifier = '';
    const possible =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < 128; i++) {
      verifier += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    const sha256Hash = Utilities.computeDigest(
      Utilities.DigestAlgorithm.SHA_256,
      verifier,
      Utilities.Charset.US_ASCII
    );
    let challenge = Utilities.base64EncodeWebSafe(sha256Hash);
    challenge = challenge.slice(0, challenge.indexOf('='));
    userProps.setProperty('code_verifier', verifier);
    userProps.setProperty('code_challenge', challenge);
  }
}

function setElementSize(element, maxWidth) {
  if (!element) {
    throw new Error('Element is not defined.');
  }
  const originalHeight = element.getHeight();
  const originalWidth = element.getWidth();

  // Calculate new width while preserving aspect ratio
  let newWidth = originalWidth;
  if (originalWidth > maxWidth) {
    newWidth = maxWidth;
  }

  element.setWidth(newWidth);
  element.setHeight((originalHeight / originalWidth) * newWidth);
}

/**
 * Inserts a base64 image into the Google Document with metadata.
 * @param {string} base64Image - The base64 encoded image string.
 * @param {string} metadata - A string containing metadata to store with the image.
 * @param {number} maxWidth - Max height to set for the new image.
 */
export function insertBase64ImageWithMetadata(
  base64Image,
  metadata,
  maxWidth = 400
) {
  // Decode the base64 string to a byte array
  const decodedBytes = Utilities.base64Decode(base64Image);

  // Create a Blob from the byte array
  const blob = Utilities.newBlob(decodedBytes, 'image/x-png', 'image');

  // Get the active document
  const doc = DocumentApp.getActiveDocument();

  // Get the cursor position
  const cursor = doc.getCursor();
  if (!cursor) {
    throw new Error('Cannot find a cursor in the document.');
  }

  // Insert the image at the cursor position
  const element = cursor.insertInlineImage(blob);
  setElementSize(element, maxWidth);

  element.setAltDescription(metadata);
}

/**
 * Reads metadata from the selected image in the Google Document and returns it.
 * @returns {string | null} String containing metadata for the selected image, or null if no image is selected.
 */
export function readSelectedImageMetadata() {
  // Get the active document
  const doc = DocumentApp.getActiveDocument();
  const selection = doc.getSelection();

  if (!selection) {
    DocumentApp.getUi().alert('No diagram selected. Please select a diagram.');
    return null;
  }

  const elements = selection.getRangeElements();
  let image = null;

  for (let i = 0; i < elements.length; i++) {
    const element = elements[i].getElement();
    if (element.getType() === DocumentApp.ElementType.INLINE_IMAGE) {
      image = element.asInlineImage();
      break;
    }
  }

  if (!image) {
    DocumentApp.getUi().alert('Please select a diagram.');
    return null;
  }

  const metadata = image.getAltDescription();

  return metadata;
}

/**
 * Replaces the selected image in the Google Document with a new one provided as a Base64 string,
 * and sets the new image size.
 * @param {string} base64Image - The new image as a Base64-encoded string.
 * @param {string} metadata - A string containing metadata to store with the image.
 * @param {number} maxWidth - Max height to set for the new image.
 */
export function replaceSelectedImageWithBase64AndSize(
  base64Image,
  metadata,
  maxWidth = 400
) {
  const doc = DocumentApp.getActiveDocument();
  const selection = doc.getSelection();

  if (!selection) {
    DocumentApp.getUi().alert('No diagram selected. Please select a diagram.');
    return;
  }

  const elements = selection.getRangeElements();
  let imageParent = null;
  let imageChildIndex = null;

  for (let i = 0; i < elements.length; i++) {
    const element = elements[i].getElement();
    if (element.getType() === DocumentApp.ElementType.INLINE_IMAGE) {
      // Get the parent of the image to replace it
      imageParent = element.getParent();
      imageChildIndex = imageParent.getChildIndex(element);
      break;
    }
  }

  if (!imageParent || imageChildIndex === null) {
    DocumentApp.getUi().alert('Please select a diagram.');
    return;
  }

  // Decode the Base64 image string to a Blob
  const decodedImage = Utilities.newBlob(
    Utilities.base64Decode(base64Image),
    'image/x-png',
    'image'
  );

  // Remove the old image
  imageParent.removeChild(imageParent.getChild(imageChildIndex));

  // Insert the new image at the same position and set its size
  const insertedImage = imageParent.insertInlineImage(
    imageChildIndex,
    decodedImage
  );
  setElementSize(insertedImage, maxWidth);
  insertedImage.setAltDescription(metadata);
}

function parseAltDescription(altDescription) {
  const params = {};
  const pairs = altDescription.split('&');
  pairs.forEach((pair) => {
    const [key, value] = pair.split('=');
    params[key] = value;
  });
  return params;
}

export function syncImages(maxWidth = 400) {
  const { token } = getAuthorizationState();
  const body = DocumentApp.getActiveDocument().getBody();
  const images = body.getImages();
  const baseURL = getBaseUrl();

  if (!baseURL) {
    throw new Error('Base URL is not defined.');
  }

  images.forEach((image) => {
    const altDescription = image.getAltDescription();
    if (altDescription) {
      // Parse the altDescription to extract documentID, major, and minor
      const params = parseAltDescription(altDescription);
      const documentID = params['documentID'];
      const major = params['major'];
      const minor = params['minor'];

      if (documentID && major && minor && token) {
        const newImageUrl = `${baseURL}/raw/${documentID}?version=v${major}.${minor}&theme=light&format=png`;

        try {
          // Fetch the new image as a blob with error handling
          const response = UrlFetchApp.fetch(newImageUrl, {
            muteHttpExceptions: true,
            headers: {
              Cookie: `mc-auth-token=${token}`,
            },
          });
          if (response.getResponseCode() === 200) {
            const blob = response.getBlob();
            const parent = image.getParent();
            const childIndex = parent.getChildIndex(image);
            Logger.log(image.getAttributes());

            // Remove the old image from its parent
            parent.removeChild(image);

            // Insert the new image at the same position within the parent
            const insertedImage = parent.insertInlineImage(childIndex, blob);
            setElementSize(insertedImage, maxWidth);
            insertedImage.setAltDescription(altDescription);
          } else {
            Logger.log(`Failed to fetch image: ${response.getContentText()}`);
          }
        } catch (error) {
          Logger.log(`Error fetching image: ${error.message}`);
        }
      }
    }
  });
}

export function getChartImages() {
  const body = DocumentApp.getActiveDocument().getBody();
  const images = body.getImages();
  const imageBase64Strings = [];

  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    const altDescription = image.getAltDescription();
    if (!altDescription) continue;
    const blob = image.getBlob();
    const base64String = Utilities.base64Encode(blob.getBytes());
    const mimeType = blob.getContentType();
    const dataUrl = 'data:' + mimeType + ';base64,' + base64String;

    const imageObject = {
      altDescription: image.getAltDescription(),
      image: dataUrl,
    };

    imageBase64Strings.push(imageObject);
  }

  return imageBase64Strings;
}

export function selectChartImage(altDescription) {
  if (!altDescription) {
    Logger.log('No altDescription provided.');
    return;
  }
  const body = DocumentApp.getActiveDocument().getBody();
  const images = body.getImages();
  const selectedImage = images.find(
    (image) => image.getAltDescription() === altDescription
  );

  if (!selectedImage) {
    Logger.log('No image found with the provided altDescription.');
    return;
  }

  // Create a range that includes the second image
  const rangeBuilder = DocumentApp.getActiveDocument().newRange();
  rangeBuilder.addElement(selectedImage);
  const range = rangeBuilder.build();

  // Set the selection to the range that includes the second image
  DocumentApp.getActiveDocument().setSelection(range);
}

export function showAlertDialog(errorText) {
  DocumentApp.getUi().alert(errorText);
}
