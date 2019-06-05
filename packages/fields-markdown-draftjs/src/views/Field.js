/** @jsx jsx */

import { jsx, css } from '@emotion/core';
import { Component } from 'react';
import { FieldContainer, FieldLabel } from '@arch-ui/fields';
import { MarkdownIcon, CodeIcon } from '@arch-ui/icons';
import Tooltip from '@arch-ui/tooltip';
import { IconButton } from '@arch-ui/button';

import Editor from './Editor';

const PreviewToggleIcon = ({ previewEnabled, onClick }) => (
  <Tooltip
    content={`${previewEnabled ? 'Disable' : 'Enable'} preview mode`}
    hideOnMouseDown
    hideOnKeyDown
  >
    {ref => (
      <IconButton
        ref={ref}
        iconSize={16}
        variant="ghost"
        css={css`
          position: absolute;
          right: 8px;
          top: 8px;
        `}
        icon={previewEnabled ? MarkdownIcon : CodeIcon}
        onClick={onClick}
      />
    )}
  </Tooltip>
);

export default class MarkdownField extends Component {
  state = {
    showPreview: false,
  };
  onChange = value => {
    if (typeof value === 'string' && value !== this.props.value) {
      this.props.onChange(value);
    }
  };
  onPreviewToggle = () => {
    this.setState({ showPreview: !this.state.showPreview });
  };

  render() {
    const { autoFocus, field, error, value: serverValue } = this.props;
    const { showPreview } = this.state;
    const value = serverValue || '';
    const rows = value.split('\n').length;
    const htmlID = `ks-input-${field.path}`;
    const canRead = !(error instanceof Error && error.name === 'AccessDeniedError');

    if (!canRead) return null;

    return (
      <FieldContainer>
        <FieldLabel
          htmlFor={htmlID}
          css={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          {field.label}
        </FieldLabel>
        <div
          css={css`
            width: 100%;
            padding: 8px;
            border: 1px solid #c1c7d0;
            border-radius: 5px;
            position: relative;
            min-height: 50px;
            max-width: 640px;
            box-sizing: border-box;
          `}
        >
          {showPreview ? (
            <Editor value={value} onChange={this.onChange} id={htmlID} autoFocus={autoFocus} />
          ) : (
            <textarea
              rows={rows}
              css={css`
                width: 100%;
                border: none;
                min-height: 50px;
                font-size: 1rem;
                outline: none;
                box-sizing: border-box;
                padding-right: 48px;
              `}
              value={value}
              onChange={e => this.props.onChange(e.target.value)}
            />
          )}
          <PreviewToggleIcon onClick={this.onPreviewToggle} previewEnabled={showPreview} />
        </div>
      </FieldContainer>
    );
  }
}
