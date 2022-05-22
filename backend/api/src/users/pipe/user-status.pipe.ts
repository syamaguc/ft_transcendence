import { BadRequestException, PipeTransform } from "@nestjs/common";

export class UserStatusPipe implements PipeTransform {
	readonly allowStatus = [
		'online',
		'offline',
	];

	transform(value: any) {
		value = value.toUpperCase();

		if (!this.isStatusValid(value)) {
			throw new BadRequestException();
		}

		return value;
	}
	private isStatusValid(status: any) {
		const result = this.allowStatus.indexOf(status);
		return result !== -1;
	}
}
