<template>
  <button><slot>Button text</slot></button>
</template>

<style lang="scss" scoped>
button,
.button {
  @include secondary-font(700);
  background-color: color(electric-blue);
  color: color(dark-gray);
  text-transform: uppercase;
  padding:.75rem .5rem;
  margin: 0 1rem;
  letter-spacing: .03rem;
  transition: background-color 0.25s ease-out, color 0.25s ease-out;
  cursor: pointer;

  &:focus, &:hover {
    color:white;
    background: color(dark-gray);
  }

  &.icon {
    display: inline-block;
    position: relative;
    background: transparent;
    min-height:40px;
    padding: 0;

    .button-label{
      text-align: left;
    }

    .fa,
    .fas,
    .far,
    .fab,
    .fal {
      background: color(dark-gray);
      color:white;
      font-size: 1.7em;
      border-right: 2px solid white;
      position: static;
      padding: 0.75rem;
      &::before{
        display: block;
        width: 2.85714rem;
      }
    }
    &:hover,
    &:active,
    &:focus{
      background: none;
      i.fa {
        color:white;
      }
    }
  }

  .button-label {
    background-color: color(electric-blue);
    min-height: 40px;
    padding: 1rem;
    text-align: center;
    width:100%;
  }

  &.outline {
    .button-label {
      background-color: white;
      border: 1px solid color(electric-blue);
    }
  }
}

button, a.button {
  color:color(dark-gray);

  &:link{
    font-weight: 600;
    font-size: 1rem;
  }

  &:hover, &:active, &:focus{
    background: color(dark-gray);
    color: white;
    .button-label {
      color: white;
      background: color(dark-gray);
      transition: background-color 300ms ease-in-out;
    }
  }
}

</style>
