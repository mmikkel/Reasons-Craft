import Reasons from 'reasons'
import Parser from './Parser'

import * as _ from 'lib/lodash'

export default class MatrixInput {

  constructor (coreClass) {

    const self = this
    const fn = coreClass.prototype

    const fnInit = fn.init
    fn.init = function () {
      fnInit.apply(this, arguments)
      self.afterInit(this)
    }

  }

  afterInit (matrixInput) {

    this.matrixInput = matrixInput;

    const handle = this.matrixInput.id.split('-').pop()
    this.fieldId = Reasons.getFieldIdByHandle(handle)

    if (!this.fieldId) return false

    console.log('matrix field after init', this.fieldId)

    // Init existing blocks
    const $blocks = this.matrixInput.$blockContainer.children()
    _.each($blocks.get(), (block) => {
      this.initBlock(block)
    })

  }

  initBlock (blockDiv) {

    const $block = $(blockDiv)

    if ($block.data('_reasons')) return false

    $block.data('_reasons', {})

    const block = $block.data('block')
    const blockType = block.$container.children('input[type="hidden"][name$="[type]"]').val()

    if (!blockType || !blockType.length) return false

    // Get conditionals for this block
    const conditionals = this.getConditionalsForBlockType(blockType)

    console.info('conds for block type', blockType)

    if (conditionals) {

      console.log('----')
      console.log('conditionals for block type', blockType, conditionals)

      $block.data('_reasons', Object.assign($block.data('_reasons'), {
        parser: new Parser(block.$fieldsContainer, conditionals)//, null, 'matrixBlockType:'+blockHandle)
      }))

      console.log('----')

    }

    console.log('block data', $block.data())

  }

  getConditionalsForBlockType (blockType) {
    return Reasons.getConditionalsForSource('matrixField:'+this.fieldId+':'+blockType)
  }

  // initBlocks () {
  //
  //   const $blocks = this.matrixInput.$blockContainer.children() // TODO: Prevent blocks
  //
  //   _.each($blocks.get(), (block) => {
  //     let $block = $(block)
  //     console.log($block.data())
  //   })
  //
  //   // each ($blocks, (block) => {
  //   //   let $block = $(block)
  //   //   console.log($block.data())
  //   // })
  //
  //   // const $blocks = this.matrixInput.$blocksContainer.children(':not([data-reasonsinit="1"])')
  //   // each($blocks, (block) => {
  //   //   const $block = $(block)
  //   //   const blockId = $block.attr('data-id')
  //   //   console.log($block.data())
  //   // })
  //
  // }

}
